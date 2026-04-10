import { PaginatedDto, SuccessResponseDto } from "@common/dtos";
import { UUID } from "@common/types";
import { getMetadataResponseDto } from "@common/utils";
import { Card, Deck, Notification, PendingMedia, User } from "@db/entities";
import {
	EntityRepository,
	FilterQuery,
	QueryOrder,
	wrap,
} from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityManager } from "@mikro-orm/postgresql";
import { ImageKitService } from "@modules/image-kit/image-kit.service";
import { NotificationResponseDto } from "@modules/notification/dtos/notification.res.dto";
import { NotificationGateway } from "@modules/notification/notification.gateway";
import { ActorResponseDto } from "@modules/user/user.res.dto";
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { omit, pick } from "lodash";
import { Visibility } from "./deck.enum";
import {
	CardResponseDto,
	UploadCardImageResponseDto,
} from "./dtos/card.res.dto";
import {
	CloneDeckDto,
	CreateDeckDto,
	GetDecksQueryDto,
	UpdateDeckDto,
} from "./dtos/deck.dto";
import {
	CreateDeckResponseDto,
	DeckStatsResponseDto,
	GetDeckResponseDto,
	GetDecksResponseDto,
	GetSharedDeckResponseDto,
	GetSharedDecksResponseDto,
} from "./dtos/deck.res.dto";

@Injectable()
export class DeckService {
	constructor(
		private readonly em: EntityManager,
		private readonly notificationGateway: NotificationGateway,
		private readonly imageKitService: ImageKitService,
		@InjectRepository(Deck)
		private readonly deckRepository: EntityRepository<Deck>,
		@InjectRepository(Card)
		private readonly cardRepository: EntityRepository<Card>,
		@InjectRepository(Notification)
		private readonly notificationRepository: EntityRepository<Notification>,
		@InjectRepository(User)
		private readonly userRepository: EntityRepository<User>,
		@InjectRepository(PendingMedia)
		private readonly pendingMediaRepo: EntityRepository<PendingMedia>,
	) {}

	async getDeck(userId: UUID, deckId: UUID): Promise<GetDeckResponseDto> {
		const deck = await this.deckRepository.findOne(
			{
				id: deckId,
				owner: userId,
			},
			{
				populate: ["cards"],
				orderBy: { cards: { term: QueryOrder.ASC_NULLS_LAST } },
			},
		);

		if (!deck) {
			throw new NotFoundException(`Deck with id "${deckId}" not found.`);
		}

		this.deckRepository.assign(deck, { openedAt: new Date() });

		await this.em.flush();

		return plainToInstance(GetDeckResponseDto, wrap(deck).toObject());
	}

	async getDecks(
		userId: UUID,
		query: GetDecksQueryDto,
	): Promise<PaginatedDto<GetDecksResponseDto>> {
		const { limit, offset, search, orderBy, order } = query;

		const where: FilterQuery<Deck> = { owner: userId };

		if (search && search.trim() !== "") where.name = { $ilike: `%${search}%` };

		const [decks, totalRecords] = await this.deckRepository.findAndCount(
			where,
			{
				limit,
				offset,
				orderBy: { [orderBy]: order },
				populate: ["cards"],
			},
		);

		const deckWithCards = decks.map((d) => {
			const plainDeck = wrap(d).toObject();

			return plainToInstance(GetDecksResponseDto, {
				...plainDeck,
				stats: this._getDeckStats(
					plainDeck.cards.map((c) => pick(c, "status")),
				),
			});
		});

		return {
			data: deckWithCards,
			metadata: getMetadataResponseDto(totalRecords, query),
		};
	}

	async getSharedDeck(
		userId: UUID | undefined,
		deckId: UUID,
	): Promise<GetSharedDeckResponseDto> {
		const where: FilterQuery<Deck> = {
			id: deckId,
			visibility: [Visibility.PUBLIC, Visibility.PROTECTED],
		};

		if (userId) where.owner = { $ne: userId };

		const deck = await this.deckRepository.findOne(where, {
			populate: ["owner", "cards"],
			orderBy: { cards: { term: QueryOrder.ASC_NULLS_LAST } },
		});

		if (!deck) {
			throw new NotFoundException(`Deck with id "${deckId}" not found.`);
		}

		deck.viewCount++;

		await this.em.flush();

		const plainDeck = wrap(deck).toObject();

		return {
			...plainDeck,
			totalCards: plainDeck.cards.length,
		};
	}

	async getSharedDecks(
		userId: UUID | undefined,
		query: GetDecksQueryDto,
	): Promise<PaginatedDto<GetSharedDecksResponseDto>> {
		const { limit, offset, search, orderBy, order } = query;

		const where: FilterQuery<Deck> = {
			visibility: [Visibility.PUBLIC, Visibility.PROTECTED],
		};

		if (userId) where.owner = { $ne: userId };
		if (search && search.trim() !== "") where.name = { $ilike: `%${search}%` };

		const [decks, totalRecords] = await this.deckRepository.findAndCount(
			where,
			{
				limit,
				offset,
				orderBy: { [orderBy]: order },
				populate: ["owner", "cards"],
			},
		);

		const data = decks.map((d) => {
			const plainDeck = wrap(d).toObject();

			return plainToInstance(GetSharedDecksResponseDto, {
				...plainDeck,
				owner: plainDeck.owner,
				totalCards: plainDeck.cards.length,
			});
		});

		return {
			data,
			metadata: getMetadataResponseDto(totalRecords, query),
		};
	}

	async uploadCardImage(
		userId: UUID,
		file: Express.Multer.File,
	): Promise<UploadCardImageResponseDto> {
		const user = await this.userRepository.findOne(userId);
		if (!user) throw new BadRequestException();

		const { url, fileId, filePath } = await this.imageKitService.uploadFile({
			userId,
			file,
			folders: ["avatars"],
		});
		if (!url || !fileId || !filePath) throw new BadRequestException();

		this.pendingMediaRepo.create({
			owner: user,
			media: { url, fileId, filePath },
		});

		await this.em.flush();

		return { fileId };
	}

	async deleteCardImage(
		userId: UUID,
		fileId: string,
	): Promise<SuccessResponseDto> {
		const image = await this.pendingMediaRepo.findOne({
			owner: userId,
			media: { fileId },
		});

		if (!image) throw new NotFoundException();
		this.em.remove(image);

		const { success } = await this.imageKitService.deleteFile(fileId);

		if (!success) throw new BadRequestException();

		return { success };
	}

	async create(
		userId: UUID,
		dto: CreateDeckDto,
	): Promise<CreateDeckResponseDto> {
		const { cards: cardDtos, ...deckDto } = dto;

		const [deck, pendingImages] = await Promise.all([
			this.deckRepository.findOne({
				name: deckDto.name,
				owner: userId,
			}),
			this.pendingMediaRepo.find({
				owner: userId,
				media: {
					fileId: {
						$in: cardDtos
							.map((c) => c.fileId)
							.filter((id): id is string => !!id),
					},
				},
			}),
		]);

		if (deck) {
			throw new BadRequestException(
				`Deck with name "${deckDto.name}" already exists.`,
			);
		}

		const newDeck = this.deckRepository.create({
			...deckDto,
			owner: userId,
			createdBy: userId,
		});

		const map = new Map(pendingImages.map((pi) => [pi.media.fileId, pi]));

		for (const cardDto of cardDtos) {
			const pendingImg = map.get(cardDto.fileId ?? "");

			this.cardRepository.create({
				...cardDto,
				deck: newDeck.id,
				image: pendingImg?.media,
			});

			if (pendingImg) this.em.remove(pendingImg);
		}

		await this.em.flush();

		return pick(newDeck, ["id", "slug"]);
	}

	async update(
		userId: UUID,
		deckId: UUID,
		dto: UpdateDeckDto,
	): Promise<SuccessResponseDto> {
		const deck = await this.deckRepository.findOne(
			{ id: deckId, owner: userId },
			{ populate: ["cards"] },
		);

		if (!deck) throw new NotFoundException();

		if (dto.visibility) {
			switch (dto.visibility) {
				case Visibility.PUBLIC:
				case Visibility.PRIVATE:
					dto.passcode = "";
					break;
				case Visibility.PROTECTED:
					if (!dto.passcode) {
						throw new BadRequestException("Passcode is required.");
					}
					break;
			}
		}

		if (dto.cards) {
			const pendingImages = await this.pendingMediaRepo.find({
				owner: userId,
				media: {
					fileId: {
						$in: dto.cards
							.map((card) => card.fileId)
							.filter((id): id is string => !!id),
					},
				},
			});

			const pendingImageMap = new Map(
				pendingImages.map((pi) => [pi.media.fileId, pi]),
			);
			const cardMap = new Map(
				deck.cards.getItems().map((card) => [card.id, card]),
			);
			const newOrUpdatedCards: Card[] = [];

			for (const cardDto of dto.cards) {
				const { id: _cardId, fileId, ...cardData } = cardDto;
				const pendingImage = fileId ? pendingImageMap.get(fileId) : undefined;

				const existingCard = cardMap.get(cardDto.id);

				// UPDATE
				if (existingCard) {
					// delete image
					if (fileId === "") {
						if (existingCard.image) {
							this.pendingMediaRepo.create({
								owner: userId,
								media: existingCard.image,
							});
						}

						existingCard.image = undefined;
					}

					// update/create image
					else if (fileId && fileId !== existingCard.image?.fileId) {
						if (!pendingImage) continue;

						if (existingCard.image) {
							this.pendingMediaRepo.create({
								owner: userId,
								media: existingCard.image,
							});

							existingCard.image = pendingImage.media;
						}

						this.em.remove(pendingImage);
					}

					this.cardRepository.assign(existingCard, cardData);
					newOrUpdatedCards.push(existingCard);
					cardMap.delete(cardDto.id);
				}

				// CREATE
				else {
					if (fileId && !pendingImage) continue;

					const newCard = this.cardRepository.create({
						...cardData,
						deck,
						image: pendingImage?.media,
					});

					if (pendingImage) this.em.remove(pendingImage);

					newOrUpdatedCards.push(newCard);
				}
			}

			// remove remaining card images & cards
			cardMap.forEach((card) => {
				if (card.image) {
					this.pendingMediaRepo.create({
						owner: userId,
						media: card.image,
					});
				}
			});

			this.em.remove(cardMap.values());

			dto.cards = newOrUpdatedCards;
		}

		this.deckRepository.assign(
			deck,
			{
				...dto,
				updatedBy: userId,
			},
			{
				ignoreUndefined: true, // ignore undefined fields to avoid overwriting
			},
		);

		await this.em.flush();

		return { success: true };
	}

	async delete(userId: UUID, deckId: UUID): Promise<SuccessResponseDto> {
		const deck = await this.deckRepository.findOne(
			{ id: deckId, owner: userId },
			{ populate: ["cards"] },
		);

		if (!deck)
			throw new NotFoundException(`Deck with id "${deckId}" not found.`);

		deck.cards
			.getItems()
			.filter((card) => !!card.image?.fileId)
			.forEach(({ image }) => {
				if (image) {
					this.pendingMediaRepo.create({
						owner: userId,
						media: image,
					});
				}
			});

		await this.em.remove(deck).flush();

		return { success: true };
	}

	async clone(
		userId: UUID,
		deckId: UUID,
		dto: CloneDeckDto,
	): Promise<SuccessResponseDto> {
		const originalDeck = await this.deckRepository.findOne(
			{
				id: deckId,
				owner: { $ne: userId },
				visibility: { $ne: Visibility.PRIVATE },
			},
			{
				populate: ["owner", "cards"],
			},
		);

		if (!originalDeck)
			throw new NotFoundException(`Deck with id "${deckId}" not found.`);

		const { id, visibility, passcode, name, description, owner, cards } =
			originalDeck;

		if (visibility === Visibility.PROTECTED && dto.passcode !== passcode)
			throw new BadRequestException("Invalid passcode.");

		const clonedDeck = this.deckRepository.create({
			name: `${name} (Clone)`,
			description,
			visibility: Visibility.PRIVATE,
			owner: userId,
			createdBy: owner.id,
			clonedFrom: id,
		});

		for (const card of cards.toArray()) {
			this.cardRepository.create({
				...omit(card, ["id", "streak", "reviewDate", "status", "image"]),
				deck: clonedDeck.id,
			});
		}

		originalDeck.learnerCount++;

		const actor = await this.userRepository.findOne(userId);
		if (!actor) throw new NotFoundException("Actor not found.");

		const notification = this.notificationRepository.create({
			entityId: id,
			type: "clone",
			content: `${actor.username} cloned your deck "${name}".`,
			actor,
			recipient: owner.id,
			readAt: null,
		});

		this.notificationGateway.sendNotification(
			plainToInstance(NotificationResponseDto, {
				...notification,
				recipientId: notification.recipient.id,
				actor: plainToInstance(ActorResponseDto, wrap(actor).toObject()),
			}),
		);

		await this.em.flush();

		return { success: true };
	}

	async restart(userId: UUID, deckId: UUID): Promise<SuccessResponseDto> {
		const deck = await this.deckRepository.findOne({
			id: deckId,
			owner: userId,
		});

		if (!deck)
			throw new NotFoundException(`Deck with ID "${deckId}" not found.`);

		const cards = await this.cardRepository.find({ deck: deckId });

		for (const c of cards) {
			this.cardRepository.assign(c, {
				streak: 0,
				reviewDate: undefined,
			});
		}

		await this.em.flush();

		return { success: true };
	}

	private _getDeckStats(cards: Pick<CardResponseDto, "status">[]) {
		const stats: DeckStatsResponseDto = {
			total: cards.length,
			known: 0,
			learning: 0,
			new: 0,
		};

		for (const c of cards) stats[c.status as keyof DeckStatsResponseDto]++;

		return stats;
	}
}
