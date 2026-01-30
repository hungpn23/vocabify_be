import { applyDecorators } from "@nestjs/common";
import { ClassConstructor, Type } from "class-transformer";
import {
	IsBoolean,
	IsDate,
	IsEmail,
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsPort,
	IsPositive,
	IsString,
	IsUrl,
	IsUUID,
	Max,
	MaxLength,
	Min,
	MinLength,
	registerDecorator,
	ValidateIf,
	ValidateNested,
	ValidationOptions,
} from "class-validator";
import { ToBoolean, ToLowerCase, ToUpperCase } from "./transforms.decorator";

type CommonOptions = Partial<{
	/**
	 * @default true
	 */
	required: boolean;

	isArray: boolean; // if prop is an array --> validate each item in array
}>;

type NumberOptions = CommonOptions &
	Partial<{
		isInt: boolean;
		isPositive: boolean;
		minimum: number;
		maximum: number;
	}>;

type StringOptions = CommonOptions &
	Partial<{
		isUUID: boolean;
		minLength: number;
		maxLength: number;
		toLowerCase: boolean;
		toUpperCase: boolean;
	}>;

type UrlOptions = CommonOptions &
	Partial<{
		require_tld: boolean;
	}>;

// **********************
// String-like validators
// **********************
export function StringValidator(
	options: StringOptions = {},
): PropertyDecorator {
	const { isArray, isUUID, minLength, maxLength, toLowerCase, toUpperCase } =
		options;
	let decorators = [Type(() => String), IsString({ each: isArray })];

	decorators = handleCommonOptions(decorators, options);

	if (isUUID) decorators.push(IsUUID("4", { each: isArray }));
	if (minLength) decorators.push(MinLength(minLength, { each: isArray }));
	if (maxLength) decorators.push(MaxLength(maxLength, { each: isArray }));
	if (toLowerCase) decorators.push(ToLowerCase());
	if (toUpperCase) decorators.push(ToUpperCase());

	return applyDecorators(...decorators);
}

export function StringValidatorOptional(
	options: Omit<StringOptions, "required"> = {},
) {
	return StringValidator({ ...options, required: false });
}

export function EmailValidator(options: StringOptions = {}): PropertyDecorator {
	const decorators = [
		IsEmail(),
		StringValidator({ ...options, toLowerCase: true }),
	];

	return applyDecorators(...decorators);
}

export function UrlValidator(options: UrlOptions = {}): PropertyDecorator {
	const { isArray, require_tld } = options;
	let decorators = [
		Type(() => String),
		IsString({ each: isArray }),
		IsUrl({ require_tld }, { each: isArray }),
	];

	decorators = handleCommonOptions(decorators, options);

	return applyDecorators(...decorators);
}

export function PasswordValidator(
	options: StringOptions = {},
): PropertyDecorator {
	let decorators = [Type(() => String), IsString(), IsPassword()];

	decorators = handleCommonOptions(decorators, options);

	return applyDecorators(...decorators);
}

// **********************
// Number-like validators
// **********************
export function NumberValidator(
	options: NumberOptions = {},
): PropertyDecorator {
	const { isArray, isInt, isPositive, minimum, maximum } = options;
	let decorators = [Type(() => Number)];

	decorators = handleCommonOptions(decorators, options);

	if (isInt) {
		decorators.push(IsInt({ each: isArray }));
	} else {
		decorators.push(IsNumber({}, { each: isArray }));
	}

	if (minimum || minimum === 0)
		decorators.push(Min(minimum, { each: isArray }));
	if (maximum || maximum === 0)
		decorators.push(Max(maximum, { each: isArray }));
	if (isPositive) decorators.push(IsPositive({ each: isArray }));

	return applyDecorators(...decorators);
}

export function NumberValidatorOptional(
	options: Omit<NumberOptions, "required"> = {},
): PropertyDecorator {
	return NumberValidator({ ...options, required: false });
}

export function PortValidator(options: CommonOptions = {}): PropertyDecorator {
	let decorators = [IsPort({ each: options.isArray })];

	decorators = handleCommonOptions(decorators, options);

	return applyDecorators(...decorators);
}

export function PortValidatorOptional(
	options: Omit<CommonOptions, "required"> = {},
): PropertyDecorator {
	return PortValidator({ ...options, required: false });
}

// ****************
// Other validators
// ****************
export function BooleanValidator(
	options: CommonOptions = {},
): PropertyDecorator {
	let decorators = [ToBoolean(), IsBoolean({ each: options.isArray })];

	decorators = handleCommonOptions(decorators, options);

	return applyDecorators(...decorators);
}

export function BooleanValidatorOptional(
	options: Omit<CommonOptions, "required"> = {},
): PropertyDecorator {
	return BooleanValidator({ ...options, required: false });
}

export function EnumValidator<T extends object>(
	entity: T,
	options: CommonOptions = {},
): PropertyDecorator {
	let decorators = [IsEnum(entity, { each: options.isArray })];

	decorators = handleCommonOptions(decorators, options);

	return applyDecorators(...decorators);
}

export function EnumValidatorOptional<T extends object>(
	entity: T,
	options: Omit<CommonOptions, "required"> = {},
) {
	return EnumValidator(entity, { ...options, required: false });
}

export function ClassValidator<T>(
	className: ClassConstructor<T>,
	options: CommonOptions = {},
): PropertyDecorator {
	let decorators = [
		Type(() => className),
		ValidateNested({ each: options.isArray }),
	];

	decorators = handleCommonOptions(decorators, options);

	return applyDecorators(...decorators);
}

export function ClassValidatorOptional<T>(
	className: ClassConstructor<T>,
	options: Omit<CommonOptions, "required"> = {},
) {
	return ClassValidator(className, { ...options, required: false });
}

export function DateValidator(options: CommonOptions = {}): PropertyDecorator {
	let decorators = [Type(() => Date), IsDate({ each: options.isArray })];

	decorators = handleCommonOptions(decorators, options);

	return applyDecorators(...decorators);
}

export function DateValidatorOptional(
	options: Omit<CommonOptions, "required"> = {},
): PropertyDecorator {
	return DateValidator({ ...options, required: false });
}

// *******
// Helpers
// *******
function IsPassword(options?: ValidationOptions): PropertyDecorator {
	return (target: object, propertyKey: string | symbol) => {
		registerDecorator({
			propertyName: propertyKey as string,
			name: "IsPassword",
			target: target.constructor,
			options,
			validator: {
				validate(value: unknown) {
					if (typeof value !== "string") return false;
					return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!#$%&*@^]).{8,}$/.test(
						value,
					);
				},
				defaultMessage() {
					return `$property must contain at least 8 characters, including uppercase, lowercase, number, and special characters`;
				},
			},
		});
	};
}

function handleCommonOptions(
	decorators: PropertyDecorator[],
	options: CommonOptions = {},
) {
	const { required = true, isArray } = options;

	decorators.push(
		required
			? IsNotEmpty({ each: isArray })
			: ValidateIf((_obj, value) => !!value),
	);

	return decorators;
}
