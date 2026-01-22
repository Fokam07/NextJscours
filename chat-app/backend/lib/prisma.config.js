import { defineConfig } from '@prisma/cli'

export default defineConfig({
  schema: './backend/prisma/schema.prisma',
  datasources: {
    db: {
      url: 'file:./data/app.db'
    }
  }
})