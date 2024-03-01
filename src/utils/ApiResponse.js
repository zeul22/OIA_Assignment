class ApiResponse {
  constructor(statusCode, data, message = "Succes") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 4000;
  }
}