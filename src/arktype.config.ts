// This file MUST be imported before any module that uses `arktype`.
// `configure` mutates the global ArkType config; it only takes effect
// for schemas built AFTER this call.
import { configure } from "arktype/config";

configure({
	onUndeclaredKey: "delete",
});
