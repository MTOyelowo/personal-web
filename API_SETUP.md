# API Setup Guide

Your v2 project now uses Next.js App Router with PostgreSQL and Prisma! 🎉

## Setup Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Database

Create a `.env` file based on `.env.example`:

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/personal_web_db"
```

### 3. Initialize Prisma

```bash
# Generate Prisma Client
pnpm exec prisma generate

# Run migrations
pnpm exec prisma migrate dev --name init
```

### 4. Seed Database (Optional)

Create a seed script in `prisma/seed.ts` to add initial data.

### 5. Run Development Server

```bash
pnpm dev
```

## API Endpoints

### Posts

- `GET /api/posts` - List posts (with pagination, filtering)
- `POST /api/posts` - Create post
- `GET /api/posts/[id]` - Get single post
- `PATCH /api/posts/[id]` - Update post
- `DELETE /api/posts/[id]` - Delete post
- `POST /api/posts/[id]/likes` - Toggle like
- `GET /api/posts/[id]/likes` - Get like status

### Auth

- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login user

### Comments

- `GET /api/comments?postId=xxx` - Get comments
- `POST /api/comments` - Create comment

### Users

- `GET /api/users/[id]` - Get user
- `PATCH /api/users/[id]` - Update user

## Database Schema

- **User** - id, name, email, password, role, avatar, bio
- **Post** - id, title, slug, content, category, tags, thumbnail
- **Comment** - id, content, with nested replies support

## Next Steps

1. Install dependencies: `pnpm install`
2. Set up your PostgreSQL database
3. Run Prisma migrations: `pnpm exec prisma migrate dev`
4. Start coding! 🚀
