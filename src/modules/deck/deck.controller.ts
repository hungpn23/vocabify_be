import {
	ApiEndpoint,
	ApiEndpointPublic,
	ApiFile,
	UseCache,
	User,
} from "@common/decorators";
import { PaginatedDto, SuccessResponseDto } from "@common/dtos";
import { validateImagePipe } from "@common/pipes/validate-image.pipe";
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
	UploadedFile,
} from "@nestjs/common";
import { DeckService } from "./deck.service";
import { UploadCardImageResponseDto } from "./dtos/card.res.dto";
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
	// private readonly logger = new Logger(DeckController.name);

	constructor(private readonly deckService: DeckService) {}

	@ApiEndpointPublic({
		responseType: PaginatedDto<GetSharedDecksResponseDto>,
		isPaginated: true,
	})
	@Get("shared")
	async getSharedMany(
		@User("userId") userId: UUID | undefined,
		@Query() query: GetDecksQueryDto,
	) {
		return await this.deckService.getSharedDecks(userId, query);
	}

	@ApiEndpointPublic({ responseType: GetSharedDeckResponseDto })
	@Get("shared/:deckId")
	async getSharedOne(
		@User("userId") userId: UUID | undefined,
		@Param("deckId", ParseUUIDPipe) deckId: UUID,
	) {
		return await this.deckService.getSharedDeck(userId, deckId);
	}

	@UseCache()
	@ApiEndpoint({
		responseType: PaginatedDto<GetDecksResponseDto>,
		isPaginated: true,
	})
	@Get()
	async getMany(
		@User("userId") userId: UUID,
		@Query() query: GetDecksQueryDto,
	) {
		return await this.deckService.getDecks(userId, query);
	}

	@UseCache()
	@ApiEndpoint({ responseType: GetDeckResponseDto })
	@Get(":deckId")
	async getOne(
		@User("userId") userId: UUID,
		@Param("deckId", ParseUUIDPipe) deckId: UUID,
	) {
		return await this.deckService.getDeck(userId, deckId);
	}

	@ApiEndpoint({ responseType: DeckResponseDto })
	@Post()
	async create(@User("userId") userId: UUID, @Body() dto: CreateDeckDto) {
		return await this.deckService.create(userId, dto);
	}

	@ApiFile("card-image")
	@ApiEndpoint({ responseType: UploadCardImageResponseDto })
	@Post("card-image")
	async uploadCardImage(
		@User("userId") userId: UUID,
		@UploadedFile(validateImagePipe())
		file: Express.Multer.File,
	) {
		return await this.deckService.uploadCardImage(userId, file);
	}

	@ApiEndpoint({ responseType: SuccessResponseDto })
	@Delete("card-image/:fileId")
	async deleteCardImage(
		@User("userId") userId: UUID,
		@Param("fileId") fileId: string,
	) {
		return await this.deckService.deleteCardImage(userId, fileId);
	}

	@ApiEndpoint({ responseType: SuccessResponseDto })
	@Patch(":deckId")
	async update(
		@User("userId") userId: UUID,
		@Param("deckId", ParseUUIDPipe) deckId: UUID,
		@Body() dto: UpdateDeckDto,
	) {
		return await this.deckService.update(userId, deckId, dto);
	}

	@ApiEndpoint({ responseType: SuccessResponseDto })
	@Delete(":deckId")
	async delete(
		@User("userId") userId: UUID,
		@Param("deckId", ParseUUIDPipe) deckId: UUID,
	) {
		return await this.deckService.delete(userId, deckId);
	}

	@ApiEndpoint({ responseType: SuccessResponseDto })
	@Post("clone/:deckId")
	async clone(
		@User("userId") userId: UUID,
		@Param("deckId", ParseUUIDPipe) deckId: UUID,
		@Body() dto: CloneDeckDto,
	) {
		return await this.deckService.clone(userId, deckId, dto);
	}

	@ApiEndpoint({ responseType: SuccessResponseDto })
	@Post("restart/:deckId")
	async restart(
		@User("userId") userId: UUID,
		@Param("deckId", ParseUUIDPipe) deckId: UUID,
	) {
		return await this.deckService.restart(userId, deckId);
	}
}
