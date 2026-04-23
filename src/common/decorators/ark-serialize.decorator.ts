import { SetMetadata } from "@nestjs/common";
import { type Type } from "arktype";

export const ARK_SERIALIZE_KEY = "ark:serialize";

export interface ArkSerializeTarget {
	isArkDto: true;
	schema: Type;
}

export const ArkSerialize = (dto: ArkSerializeTarget) =>
	SetMetadata(ARK_SERIALIZE_KEY, dto);
