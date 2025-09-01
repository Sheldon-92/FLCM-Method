"use strict";
/**
 * FLCM Command System Types
 * Core type definitions for the FLCM command system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FLCMCommandError = void 0;
class FLCMCommandError extends Error {
    constructor(code, message, suggestions, examples) {
        super(message);
        this.code = code;
        this.suggestions = suggestions;
        this.examples = examples;
        this.name = 'FLCMCommandError';
    }
}
exports.FLCMCommandError = FLCMCommandError;
//# sourceMappingURL=types.js.map