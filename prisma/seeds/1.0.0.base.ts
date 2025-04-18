// prisma/seeds/1.0.base.ts
import { BaseSeedTask } from './BaseSeedTask'

export default class Seed_1_0_Base extends BaseSeedTask {
    static version = '1.0'

    protected async run() {
        // Create default permissions
        const defaultPermissions = [
            // Post permissions
            { name: 'posts.create', description: 'Create new posts' },
            { name: 'posts.read', description: 'Read posts' },
            { name: 'posts.update', description: 'Update posts' },
            { name: 'posts.delete', description: 'Delete posts' },
            
            // User permissions
            { name: 'users.create', description: 'Create users' },
            { name: 'users.read', description: 'Read user profiles' },
            { name: 'users.update', description: 'Update user profiles' },
            { name: 'users.delete', description: 'Delete users' },
            
            // Comment permissions
            { name: 'comments.create', description: 'Create comments' },
            { name: 'comments.read', description: 'Read comments' },
            { name: 'comments.update', description: 'Update comments' },
            { name: 'comments.delete', description: 'Delete comments' },
            
            // Category permissions
            { name: 'categories.create', description: 'Create categories' },
            { name: 'categories.read', description: 'Read categories' },
            { name: 'categories.update', description: 'Update categories' },
            { name: 'categories.delete', description: 'Delete categories' },
            
            // Tag permissions
            { name: 'tags.create', description: 'Create tags' },
            { name: 'tags.read', description: 'Read tags' },
            { name: 'tags.update', description: 'Update tags' },
            { name: 'tags.delete', description: 'Delete tags' },
            
            // Vote permissions
            { name: 'votes.create', description: 'Create votes' },
            { name: 'votes.read', description: 'Read votes' },
            { name: 'votes.delete', description: 'Delete votes' },
        ]

        await this.prisma.permission.createMany({
            data: defaultPermissions,
            skipDuplicates: true
        });

        console.log('Base permissions seeded successfully');
    }
}
