import prisma from './prisma';

/**
 * Creates an audit log entry.
 * 
 * @param {string} action - The action performed (e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN').
 * @param {string} entity - The entity affected (e.g., 'User', 'Settings', 'Hero').
 * @param {string|number} entityId - The ID of the affected entity.
 * @param {object|string} details - Additional details, usually the previous state or diff.
 * @param {number} userId - The ID of the user performing the action.
 */
export async function createAuditLog(action, entity, entityId, details, userId) {
    try {
        await prisma.auditLog.create({
            data: {
                action,
                entity,
                entityId: String(entityId),
                details: typeof details === 'object' ? JSON.stringify(details) : details,
                userId: userId ? Number(userId) : null,
            },
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
        // We don't want to fail the main operation if logging fails, but we should log the error.
    }
}
