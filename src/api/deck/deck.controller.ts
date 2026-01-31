import { ApiEndpoint, ApiEndpointPublic, User } from "@common/decorators";
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
	DeckDto,
	GetManyQueryDto,
	GetManyResDto,
	GetOneResDto,
	GetSharedManyResDto,
	GetSharedOneResDto,
	UpdateDeckDto,
} from "./dtos/deck.dto";

@Controller("decks")
export class DeckController {
	constructor(private readonly deckService: DeckService) {}

	@ApiEndpointPublic({ type: GetSharedManyResDto, isPaginated: true })
	@Get("shared")
	async getSharedMany(
		@User("userId") userId: UUID | undefined,
		@Query() query: GetManyQueryDto,
	) {
		return await this.deckService.getSharedMany(userId, query);
	}

	@ApiEndpointPublic({ type: GetSharedOneResDto })
	@Get("shared/:deckId")
	async getSharedOne(
		@User("userId") userId: UUID | undefined,
		@Param("deckId", ParseUUIDPipe) deckId: UUID,
	) {
		return await this.deckService.getSharedOne(userId, deckId);
	}

	@ApiEndpoint({ type: GetManyResDto, isPaginated: true })
	@Get()
	async getMany(@User("userId") userId: UUID, @Query() query: GetManyQueryDto) {
		return await this.deckService.getMany(userId, query);
	}

	@ApiEndpoint({ type: GetOneResDto })
	@Get(":deckId")
	async getOne(
		@User("userId") userId: UUID,
		@Param("deckId", ParseUUIDPipe) deckId: UUID,
	) {
		return await this.deckService.getOne(userId, deckId);
	}

	@ApiEndpoint({ type: DeckDto })
	@Post()
	async create(@User("userId") userId: UUID, @Body() dto: CreateDeckDto) {
		return await this.deckService.create(userId, dto);
	}

	@ApiEndpoint({ type: DeckDto })
	@Patch(":deckId")
	async update(
		@User("userId") userId: UUID,
		@Param("deckId", ParseUUIDPipe) deckId: UUID,
		@Body() dto: UpdateDeckDto,
	) {
		return await this.deckService.update(userId, deckId, dto);
	}

	@ApiEndpoint()
	@Delete(":deckId")
	async delete(
		@User("userId") userId: UUID,
		@Param("deckId", ParseUUIDPipe) deckId: UUID,
	) {
		return await this.deckService.delete(userId, deckId);
	}

	@ApiEndpoint()
	@Post("clone/:deckId")
	async clone(
		@User("userId") userId: UUID,
		@Param("deckId", ParseUUIDPipe) deckId: UUID,
		@Body() dto: CloneDeckDto,
	) {
		return await this.deckService.clone(userId, deckId, dto);
	}

	@ApiEndpoint()
	@Post("restart/:deckId")
	async restart(
		@User("userId") userId: UUID,
		@Param("deckId", ParseUUIDPipe) deckId: UUID,
	) {
		return await this.deckService.restart(userId, deckId);
	}
}
