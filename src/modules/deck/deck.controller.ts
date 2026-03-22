import {
	ApiEndpoint,
	ApiEndpointPublic,
	UseCache,
	User,
} from "@common/decorators";
import { PaginatedDto, SuccessResponseDto } from "@common/dtos";
import { type UUID } from "@common/types";
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
} from "@nestjs/common";
import { DeckService } from "./deck.service";
import {
	CloneDeckDto,
	CreateDeckDto,
	GetDecksQueryDto,
	UpdateDeckDto,
} from "./dtos/deck.dto";
import {
	DeckResponseDto,
	GetDeckResponseDto,
	GetDecksResponseDto,
	GetSharedDeckResponseDto,
	GetSharedDecksResponseDto,
} from "./dtos/deck.res.dto";

@Controller("decks")
export class DeckController {
	constructor(private readonly deckService: DeckService) {}

	@ApiEndpointPublic({
		type: PaginatedDto<GetSharedDecksResponseDto>,
		isPaginated: true,
	})
	@Get("shared")
	async getSharedMany(
		@User("userId") userId: UUID | undefined,
		@Query() query: GetDecksQueryDto,
	) {
		return await this.deckService.getSharedDecks(userId, query);
	}

	@ApiEndpointPublic({ type: GetSharedDeckResponseDto })
	@Get("shared/:deckId")
	async getSharedOne(
		@User("userId") userId: UUID | undefined,
		@Param("deckId", ParseUUIDPipe) deckId: UUID,
	) {
		return await this.deckService.getSharedDeck(userId, deckId);
	}

	@UseCache()
	@ApiEndpoint({ type: PaginatedDto<GetDecksResponseDto>, isPaginated: true })
	@Get()
	async getMany(
		@User("userId") userId: UUID,
		@Query() query: GetDecksQueryDto,
	) {
		return await this.deckService.getDecks(userId, query);
	}

	@UseCache()
	@ApiEndpoint({ type: GetDeckResponseDto })
	@Get(":deckId")
	async getOne(
		@User("userId") userId: UUID,
		@Param("deckId", ParseUUIDPipe) deckId: UUID,
	) {
		return await this.deckService.getDeck(userId, deckId);
	}

	@ApiEndpoint({ type: DeckResponseDto })
	@Post()
	async create(@User("userId") userId: UUID, @Body() dto: CreateDeckDto) {
		return await this.deckService.create(userId, dto);
	}

	@ApiEndpoint({ type: SuccessResponseDto })
	@Patch(":deckId")
	async update(
		@User("userId") userId: UUID,
		@Param("deckId", ParseUUIDPipe) deckId: UUID,
		@Body() dto: UpdateDeckDto,
	) {
		return await this.deckService.update(userId, deckId, dto);
	}

	@ApiEndpoint({ type: SuccessResponseDto })
	@Delete(":deckId")
	async delete(
		@User("userId") userId: UUID,
		@Param("deckId", ParseUUIDPipe) deckId: UUID,
	) {
		return await this.deckService.delete(userId, deckId);
	}

	@ApiEndpoint({ type: SuccessResponseDto })
	@Post("clone/:deckId")
	async clone(
		@User("userId") userId: UUID,
		@Param("deckId", ParseUUIDPipe) deckId: UUID,
		@Body() dto: CloneDeckDto,
	) {
		return await this.deckService.clone(userId, deckId, dto);
	}

	@ApiEndpoint({ type: SuccessResponseDto })
	@Post("restart/:deckId")
	async restart(
		@User("userId") userId: UUID,
		@Param("deckId", ParseUUIDPipe) deckId: UUID,
	) {
		return await this.deckService.restart(userId, deckId);
	}
}
