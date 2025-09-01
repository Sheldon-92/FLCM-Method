"use strict";
/**
 * FLCM Agent System Types
 * Core type definitions for the 3-layer agent system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitState = exports.ErrorType = exports.AgentState = void 0;
// Agent states
var AgentState;
(function (AgentState) {
    AgentState["IDLE"] = "idle";
    AgentState["INITIALIZING"] = "initializing";
    AgentState["ACTIVE"] = "active";
    AgentState["PROCESSING"] = "processing";
    AgentState["ERROR"] = "error";
    AgentState["SHUTDOWN"] = "shutdown";
})(AgentState = exports.AgentState || (exports.AgentState = {}));
// Error handling types
var ErrorType;
(function (ErrorType) {
    ErrorType["NETWORK_ERROR"] = "NETWORK_ERROR";
    ErrorType["TIMEOUT"] = "TIMEOUT";
    ErrorType["RATE_LIMIT"] = "RATE_LIMIT";
    ErrorType["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorType["AGENT_ERROR"] = "AGENT_ERROR";
    ErrorType["SYSTEM_ERROR"] = "SYSTEM_ERROR";
})(ErrorType = exports.ErrorType || (exports.ErrorType = {}));
// Circuit breaker states
var CircuitState;
(function (CircuitState) {
    CircuitState["CLOSED"] = "closed";
    CircuitState["OPEN"] = "open";
    CircuitState["HALF_OPEN"] = "half_open";
})(CircuitState = exports.CircuitState || (exports.CircuitState = {}));
//# sourceMappingURL=types.js.map