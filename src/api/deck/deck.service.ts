import { NotificationDto } from "@api/notification/notification.dto";
import { NotificationGateway } from "@api/notification/notification.gateway";
import { PaginatedDto } from "@common/dtos";
import { UUID } from "@common/types";
import { createMetadata } from "@common/utils";
import { Card, Deck, Notification } from "@db/entities";
import {
	EntityRepository,
	FilterQuery,
	QueryOrder,
	wrap,
} from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityManager } from "@mikro-orm/postgresql";
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { assign, omit, pick } from "lodash";
import { Visibility } from "./deck.enum";
import { CardDto } from "./dtos/card.dto";
import {
	CloneDeckDto,
	CreateDeckDto,
	CreateDeckResDto,
	DeckStatsDto,
	GetManyQueryDto,
	GetManyResDto,
	GetOneResDto,
	GetSharedManyResDto,
	GetSharedOneResDto,
	UpdateDeckDto,
} from "./dtos/deck.dto";

@Injectable()
export class DeckService {
	constructor(
		private readonly em: EntityManager,
		private readonly notificationGateway: NotificationGateway,
		@InjectRepository(Deck)
		private readonly deckRepository: EntityRepository<Deck>,
		@InjectRepository(Card)
		private readonly cardRepository: EntityRepository<Card>,
		@InjectRepository(Notification)
		private readonly notificationRepository: EntityRepository<Notification>,
	) {}

	async getOne(userId: UUID, deckId: UUID) {
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

		const plainDeck = wrap(deck).toPOJO();
		const cards = plainDeck.cards.map((c) => omit(c, ["deck"]));

		return plainToInstance(GetOneResDto, assign(plainDeck, { cards }));
	}

	async getMany(userId: UUID, query: GetManyQueryDto) {
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
			const plainDeck = wrap(d).toPOJO();

			return plainToInstance(GetManyResDto, {
				...plainDeck,
				stats: this._getDeckStats(
					plainDeck.cards.map((c) => pick(c, "status")),
				),
			});
		});

		return plainToInstance(PaginatedDto<GetManyResDto>, {
			data: deckWithCards,
			metadata: createMetadata(totalRecords, query),
		});
	}

	async getSharedOne(userId: UUID | undefined, deckId: UUID) {
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

		const plainDeck = wrap(deck).toPOJO();

		return plainToInstance(GetSharedOneResDto, {
			...plainDeck,
			totalCards: plainDeck.cards.length,
		});
	}

	async getSharedMany(userId: UUID | undefined, query: GetManyQueryDto) {
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
			const plainDeck = wrap(d).toPOJO();

			return plainToInstance(GetSharedManyResDto, {
				...plainDeck,
				totalCards: plainDeck.cards.length,
			});
		});

		return plainToInstance(PaginatedDto<GetSharedManyResDto>, {
			data,
			metadata: createMetadata(totalRecords, query),
		});
	}

	async create(userId: UUID, dto: CreateDeckDto) {
		const { cards: cardDtos, ...deckDto } = dto;

		const deck = await this.deckRepository.findOne({
			name: deckDto.name,
			owner: userId,
		});
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

		for (const c of cardDtos) {
			this.cardRepository.create({
				...c,
				deck: newDeck.id,
			});
		}

		await this.em.flush();

		return plainToInstance(CreateDeckResDto, pick(newDeck, ["id", "slug"]));
	}

	async update(userId: UUID, deckId: UUID, dto: UpdateDeckDto) {
		const deck = await this.deckRepository.findOne(
			{ id: deckId, owner: userId },
			{ populate: ["cards"] },
		);

		if (!deck)
			throw new NotFoundException(`Deck with id "${deckId}" not found.`);

		if (dto.name && dto.name !== deck.name) {
			const existingDeck = await this.deckRepository.findOne({
				name: dto.name,
				owner: userId,
			});

			if (existingDeck)
				throw new BadRequestException(
					`Deck with name "${dto.name}" already exists.`,
				);
		}

		if (dto.visibility) {
			switch (dto.visibility) {
				case Visibility.PUBLIC:
				case Visibility.PRIVATE:
					dto.passcode = "";
					break;
				case Visibility.PROTECTED:
					if (!dto.passcode)
						throw new BadRequestException(
							"Passcode is required for protected visibility.",
						);
					break;
			}
		}

		if (dto.cards) {
			const cardMap = new Map(deck.cards.getItems().map((c) => [c.id, c]));
			const newOrUpdatedCards: Card[] = [];

			for (const cardDto of dto.cards) {
				const existingCard = cardMap.get(cardDto.id);

				if (existingCard) {
					// update existing card
					this.cardRepository.assign(existingCard, cardDto);
					newOrUpdatedCards.push(existingCard);
					cardMap.delete(cardDto.id);
				} else {
					// add new card
					const { id: _tempId, ...cardData } = cardDto;
					const newCard = this.cardRepository.create({ ...cardData, deck });
					newOrUpdatedCards.push(newCard);
				}
			}

			// remove cards remaining
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
	}

	async delete(userId: UUID, deckId: UUID) {
		const deck = await this.deckRepository.findOne(
			{ id: deckId, owner: userId },
			{ populate: ["cards"] },
		);

		if (!deck)
			throw new NotFoundException(`Deck with id "${deckId}" not found.`);

		await this.em.remove(deck).flush();
	}

	async clone(userId: UUID, deckId: UUID, dto: CloneDeckDto) {
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
				...omit(card, ["id", "streak", "reviewDate", "status"]),
				deck: clonedDeck.id,
			});
		}

		originalDeck.learnerCount++;

		const notification = this.notificationRepository.create({
			entityId: id,
			content: `Your deck "${name}" has been cloned by an user.`,
			actor: userId,
			recipient: owner.id,
		});

		await this.em.flush();

		this.notificationGateway.sendNotification(
			plainToInstance(NotificationDto, wrap(notification).toPOJO()),
		);
	}

	async restart(userId: UUID, deckId: UUID) {
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
	}

	private _getDeckStats(cards: Pick<CardDto, "status">[]): DeckStatsDto {
		const stats: DeckStatsDto = {
			total: cards.length,
			known: 0,
			learning: 0,
			new: 0,
		};

		for (const c of cards) stats[c.status as keyof DeckStatsDto]++;

		return stats;
	}
}
