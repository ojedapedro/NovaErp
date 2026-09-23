"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyCode = exports.DocumentType = exports.TaxType = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["CONTADOR"] = "CONTADOR";
    UserRole["CAJERO"] = "CAJERO";
    UserRole["AUDITOR"] = "AUDITOR";
    UserRole["RRHH"] = "RRHH";
})(UserRole || (exports.UserRole = UserRole = {}));
var TaxType;
(function (TaxType) {
    TaxType["IVA"] = "IVA";
    TaxType["ISLR"] = "ISLR";
    TaxType["IGTF"] = "IGTF";
})(TaxType || (exports.TaxType = TaxType = {}));
var DocumentType;
(function (DocumentType) {
    DocumentType["INVOICE"] = "INVOICE";
    DocumentType["CREDIT_NOTE"] = "CREDIT_NOTE";
    DocumentType["DEBIT_NOTE"] = "DEBIT_NOTE";
    DocumentType["RETENTION_VOUCHER"] = "RETENTION_VOUCHER";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
var CurrencyCode;
(function (CurrencyCode) {
    CurrencyCode["VES"] = "VES";
    CurrencyCode["USD"] = "USD";
    CurrencyCode["EUR"] = "EUR";
})(CurrencyCode || (exports.CurrencyCode = CurrencyCode = {}));
