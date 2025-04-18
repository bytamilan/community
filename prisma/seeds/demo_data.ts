// prisma/seeds/demo-data.ts
import { faker } from '@faker-js/faker';
import {
    Category,
    Profile,
    Post,
    Comment,
    Vote,
} from '@prisma/client';
import { BaseSeedTask } from './BaseSeedTask';

export default class DemoDataSeed extends BaseSeedTask {
    static version = 'demo-data';

    protected async run() {
        // 1️⃣ Categories
        const categories = await this.createCategories();

        // 2️⃣ Profiles
        const profiles = await this.createProfiles(10);

        // 3️⃣ Posts
        const posts = await this.createPosts(profiles, categories);

        // 4️⃣ Comments
        const comments = await this.createComments(profiles, posts);

        // 5️⃣ Votes
        await this.createVotes(profiles, posts, comments);

        console.log('✅ Demo data seeded successfully');
    }

    private async createCategories(): Promise<Category[]> {
        const data = [
            {
                name: 'Technology',
                slug: 'technology',
                description: 'Tech-related discussions',
                creditRequirement: 0,
                isPremium: false,
            },
            {
                name: 'Science',
                slug: 'science',
                description: 'Scientific discoveries and discussions',
                creditRequirement: 0,
                isPremium: false,
            },
            {
                name: 'Programming',
                slug: 'programming',
                description: 'Programming & software development',
                creditRequirement: 5,
                isPremium: true,
            },
            {
                name: 'Design',
                slug: 'design',
                description: 'Design principles & discussions',
                creditRequirement: 0,
                isPremium: false,
            },
            {
                name: 'Gaming',
                slug: 'gaming',
                description: 'Gaming & eSports',
                creditRequirement: 0,
                isPremium: false,
            },
        ];

        await this.prisma.category.createMany({
            data,
            skipDuplicates: true,
        });

        return this.prisma.category.findMany({
            where: { slug: { in: data.map((c) => c.slug) } },
        });
    }

    private async createProfiles(count: number): Promise<Profile[]> {
        const items = Array.from({ length: count }, () => ({
            id: faker.string.uuid(),
            username: faker.internet.userName().toLowerCase(),
            fullName: faker.person.fullName(),
            avatarUrl: faker.image.avatar(),
            bio: faker.person.bio(),
            credits: faker.number.int({ min: 10, max: 1000 }),
        }));

        await this.prisma.profile.createMany({
            data: items,
            skipDuplicates: true,
        });

        return this.prisma.profile.findMany({
            where: { id: { in: items.map((p) => p.id) } },
        });
    }

    private async createPosts(
        profiles: Profile[],
        categories: Category[]
    ): Promise<Post[]> {
        const items = Array.from({ length: 20 }, () => {
            const author = faker.helpers.arrayElement(profiles);
            const category = faker.helpers.arrayElement(categories);
            return {
                id: faker.string.uuid(),
                title: faker.lorem.sentence(),
                content: faker.lorem.paragraphs({ min: 1, max: 3 }),
                authorId: author.id,
                categoryId: category.id,
                viewCount: faker.number.int({ min: 0, max: 5000 }),
                upvotes: faker.number.int({ min: 0, max: 200 }),
                downvotes: faker.number.int({ min: 0, max: 50 }),
                creditCost: faker.number.int({ min: 1, max: 10 }),
                isPublished: true,
            };
        });

        await this.prisma.post.createMany({
            data: items,
            skipDuplicates: true,
        });

        return this.prisma.post.findMany({
            where: { id: { in: items.map((p) => p.id) } },
        });
    }

    private async createComments(
        profiles: Profile[],
        posts: Post[]
    ): Promise<Comment[]> {
        const items = Array.from({ length: 50 }, () => {
            const author = faker.helpers.arrayElement(profiles);
            const post = faker.helpers.arrayElement(posts);
            return {
                id: faker.string.uuid(),
                content: faker.lorem.paragraph(),
                authorId: author.id,
                postId: post.id,
                parentId: null,
                upvotes: faker.number.int({ min: 0, max: 50 }),
                downvotes: faker.number.int({ min: 0, max: 20 }),
            };
        });

        await this.prisma.comment.createMany({
            data: items,
            skipDuplicates: true,
        });

        return this.prisma.comment.findMany({
            where: { id: { in: items.map((c) => c.id) } },
        });
    }

    private async createVotes(
        profiles: Profile[],
        posts: Post[],
        comments: Comment[]
    ): Promise<Vote[]> {
        const items = Array.from({ length: 100 }, () => {
            const voter = faker.helpers.arrayElement(profiles);
            // 80% votes on posts, 20% on comments
            if (faker.number.int({ min: 1, max: 100 }) <= 80) {
                return {
                    id: faker.string.uuid(),
                    userId: voter.id,
                    postId: faker.helpers.arrayElement(posts).id,
                    commentId: null,
                    voteType: faker.helpers.arrayElement([1, -1]),
                };
            } else {
                return {
                    id: faker.string.uuid(),
                    userId: voter.id,
                    postId: null,
                    commentId: faker.helpers.arrayElement(comments).id,
                    voteType: faker.helpers.arrayElement([1, -1]),
                };
            }
        });

        await this.prisma.vote.createMany({
            data: items,
            skipDuplicates: true,
        });

        return this.prisma.vote.findMany({
            where: { id: { in: items.map((v) => v.id) } },
        });
    }
}
