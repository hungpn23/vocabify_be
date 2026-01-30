import { OwnerDto } from "@api/user/user.dto";
import {
	ClassValidator,
	ClassValidatorOptional,
	EnumValidator,
	EnumValidatorOptional,
	StringValidator,
	StringValidatorOptional,
} from "@common/decorators/validators.decorator";
import { QueryDto } from "@common/dtos/offset-pagination/offset-pagination.dto";
import { type UUID } from "@common/types/branded.type";
import { PickType } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { ArrayMinSize, ValidateIf } from "class-validator";
import { DeckOrderBy, Visibility } from "../deck.enum";
import {
	CardDto,
	CreateCardDto,
	PreviewCardDto,
	UpdateCardDto,
} from "./card.dto";

export class CreateDeckDto {
	@StringValidator({ minLength: 3 })
	name!: string;

	@StringValidatorOptional()
	description?: string | null;

	@EnumValidator(Visibility)
	visibility!: Visibility;

	/**
	 * Required if visibility is PROTECTED. Must be 4-20 characters.
	 */
	@ValidateIf((o) => (o as CreateDeckDto).visibility === Visibility.PROTECTED)
	@StringValidator({ minLength: 4, maxLength: 20 })
	passcode?: string;

	// @ApiProperty({ type: () => [CreateCardDto], minItems: 4 })
	@ArrayMinSize(4)
	@ClassValidator(CreateCardDto, { isArray: true })
	cards!: CreateCardDto[];
}

export class UpdateDeckDto extends PickType(CreateDeckDto, [
	"description",
	"passcode",
]) {
	@StringValidatorOptional({ minLength: 3 })
	name?: string;

	@EnumValidatorOptional(Visibility)
	visibility?: Visibility;

	@ClassValidatorOptional(UpdateCardDto, { isArray: true })
	cards?: UpdateCardDto[];
}

export class CloneDeckDto {
	@StringValidatorOptional()
	passcode?: string;
}

export class GetManyQueryDto extends QueryDto {
	@EnumValidatorOptional(DeckOrderBy)
	orderBy: DeckOrderBy = DeckOrderBy.OPENED_AT;
}

@Exclude()
export class DeckDto {
	@Expose()
	id!: UUID;

	@Expose()
	name!: string;

	@Expose()
	slug!: string;

	@Expose()
	description?: string | null;

	@Expose()
	visibility!: Visibility;

	@Expose()
	viewCount!: number;

	@Expose()
	learnerCount!: number;

	@Expose()
	clonedFrom?: Pick<DeckDto, "id" | "name"> | null;

	@Expose()
	openedAt?: Date | null;

	@Expose()
	createdAt!: Date;
}

@Exclude()
export class DeckStatsDto {
	@Expose()
	total!: number;

	@Expose()
	known!: number;

	@Expose()
	learning!: number;

	@Expose()
	new!: number;
}

@Exclude()
export class GetOneResDto extends PickType(DeckDto, [
	"id",
	"name",
	"slug",
	"description",
]) {
	@Expose()
	cards!: CardDto[];
}

@Exclude()
export class GetManyResDto extends PickType(DeckDto, [
	"id",
	"name",
	"slug",
	"visibility",
	"openedAt",
]) {
	@Expose()
	stats!: DeckStatsDto;
}

@Exclude()
export class GetSharedOneResDto extends PickType(DeckDto, [
	"id",
	"name",
	"description",
	"visibility",
]) {
	@Expose()
	totalCards!: number;

	@Expose()
	owner!: OwnerDto;

	@Expose()
	cards!: PreviewCardDto[];
}

@Exclude()
export class GetSharedManyResDto extends PickType(DeckDto, [
	"id",
	"name",
	"slug",
	"visibility",
	"viewCount",
	"learnerCount",
	"createdAt",
]) {
	@Expose()
	totalCards!: number;

	@Expose()
	owner!: OwnerDto;
}

@Exclude()
export class CreateDeckResDto extends PickType(DeckDto, ["id", "slug"]) {}
