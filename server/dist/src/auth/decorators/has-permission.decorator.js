"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HasPermission = exports.PERMISSIONS_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.PERMISSIONS_KEY = 'permissions';
const HasPermission = (...permissions) => (0, common_1.SetMetadata)(exports.PERMISSIONS_KEY, permissions);
exports.HasPermission = HasPermission;
//# sourceMappingURL=has-permission.decorator.js.map