class UdyamException(Exception):
    """Base exception for all Udyam OS domain errors."""
    def __init__(self, message: str, code: str = "INTERNAL_ERROR", details: dict = None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.details = details or {}

class SessionNotFoundError(UdyamException):
    def __init__(self, session_id: str):
        super().__init__(f"Session '{session_id}' not found", code="SESSION_NOT_FOUND")

class StateConflictError(UdyamException):
    def __init__(self, message: str):
        super().__init__(message, code="STATE_CONFLICT")

class PathTraversalError(UdyamException):
    def __init__(self, path: str):
        super().__init__(f"Path traversal access denied for: {path}", code="ACCESS_DENIED")

class AgentExecutionError(UdyamException):
    def __init__(self, agent_name: str, message: str):
        super().__init__(f"Agent '{agent_name}' execution failed: {message}", code="AGENT_EXECUTION_FAILED")

class VerificationError(UdyamException):
    def __init__(self, message: str):
        super().__init__(message, code="VERIFICATION_FAILED")
