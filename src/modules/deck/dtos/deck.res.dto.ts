import { type UUID } from "@common/types";
import { OwnerResponseDto } from "@modules/user/user.res.dto";
import { PickType } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { Visibility } from "../deck.enum";
import { CardResponseDto, PreviewCardResponseDto } from "./card.res.dto";

@Exclude()
export class DeckResponseDto {
	@Expose()
	id!: UUID;

	@Expose()
	name!: string;

	@Expose()
	slug!: string;

	@Expose()
	description?: string;

	@Expose()
	visibility!: Visibility;

	@Expose()
	viewCount!: number;

	@Expose()
	learnerCount!: number;

	@Expose()
	clonedFrom?: Pick<DeckResponseDto, "id" | "name">;

	@Expose()
	openedAt?: Date;

	@Expose()
	createdAt!: Date;
}

@Exclude()
export class DeckStatsResponseDto {
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
export class GetDeckResponseDto extends PickType(DeckResponseDto, [
	"id",
	"name",
	"slug",
	"description",
]) {
	@Expose()
	cards!: CardResponseDto[];
}

@Exclude()
export class GetDecksResponseDto extends PickType(DeckResponseDto, [
	"id",
	"name",
	"slug",
	"visibility",
	"openedAt",
]) {
	@Expose()
	stats!: DeckStatsResponseDto;
}

@Exclude()
export class GetSharedDeckResponseDto extends PickType(DeckResponseDto, [
	"id",
	"name",
	"description",
	"visibility",
]) {
	@Expose()
	totalCards!: number;

	@Expose()
	owner!: OwnerResponseDto;

	@Expose()
	cards!: PreviewCardResponseDto[];
}

@Exclude()
export class GetSharedDecksResponseDto extends PickType(DeckResponseDto, [
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
	owner!: OwnerResponseDto;
}

@Exclude()
export class CreateDeckResponseDto extends PickType(DeckResponseDto, [
	"id",
	"slug",
]) {}
