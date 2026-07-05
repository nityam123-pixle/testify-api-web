export interface Framework {
  name: string
  verified: boolean
  description: string
  icon: string
  status: 'VERIFIED' | 'PATTERN' | 'EXPERIMENTAL' | 'COMING SOON'
}

export interface LanguageGroup {
  language: string
  frameworks: Framework[]
}

// safeName generates the file name matching the python download script
const getIcon = (fw: string) => `/icons/frameworks/${fw.toLowerCase().replace('.', '').replace(' ', '-')}.svg`

export const FRAMEWORK_GROUPS: LanguageGroup[] = [
  {
    language: 'Node.js',
    frameworks: [
      { name: 'NestJS', verified: true, status: 'VERIFIED', description: 'Progressive Node.js framework', icon: getIcon('NestJS') },
      { name: 'Next.js', verified: true, status: 'VERIFIED', description: 'React Fullstack Framework', icon: getIcon('Next.js') },
      { name: 'Express', verified: false, status: 'PATTERN', description: 'Minimal web framework', icon: getIcon('Express') },
      { name: 'Fastify', verified: false, status: 'PATTERN', description: 'High performance web framework', icon: getIcon('Fastify') },
      { name: 'Hono', verified: false, status: 'PATTERN', description: 'Ultrafast web framework', icon: getIcon('Hono') },
      { name: 'Koa', verified: false, status: 'PATTERN', description: 'Expressive middleware framework', icon: getIcon('Koa') },
      { name: 'AdonisJS', verified: false, status: 'PATTERN', description: 'Fullstack MVC framework', icon: getIcon('AdonisJS') },
      { name: 'Sails.js', verified: false, status: 'PATTERN', description: 'MVC framework for Node.js', icon: getIcon('Sails.js') },
      { name: 'Restify', verified: false, status: 'PATTERN', description: 'Node.js REST framework', icon: getIcon('Restify') },
      { name: 'Hapi.js', verified: false, status: 'PATTERN', description: 'Rich framework for building apps', icon: getIcon('Hapi.js') },
      { name: 'Polka', verified: false, status: 'PATTERN', description: 'Tiny web framework on top of raw Node.js', icon: getIcon('Polka') },
      { name: 'Feathers', verified: false, status: 'PATTERN', description: 'REST & real-time microservices', icon: getIcon('Feathers') },
      { name: 'ts-rest', verified: false, status: 'PATTERN', description: 'Type-safe APIs for TypeScript', icon: getIcon('ts-rest') },
      { name: 'tRPC', verified: false, status: 'PATTERN', description: 'End-to-end typesafe APIs', icon: getIcon('tRPC') },
    ],
  },
  {
    language: 'Bun',
    frameworks: [
      { name: 'Elysia', verified: false, status: 'PATTERN', description: 'Fast and elegant Web Framework', icon: getIcon('Elysia') }
    ],
  },
  {
    language: 'Python',
    frameworks: [
      { name: 'FastAPI', verified: true, status: 'VERIFIED', description: 'High-performance web framework', icon: getIcon('FastAPI') },
      { name: 'Flask', verified: false, status: 'PATTERN', description: 'Micro web framework', icon: getIcon('Flask') },
      { name: 'Django', verified: false, status: 'PATTERN', description: 'High-level Python web framework', icon: getIcon('Django') },
      { name: 'Litestar', verified: false, status: 'PATTERN', description: 'Lightweight & powerful ASGI framework', icon: getIcon('Litestar') },
      { name: 'Tornado', verified: false, status: 'PATTERN', description: 'Scalable, non-blocking web server', icon: getIcon('Tornado') },
      { name: 'aiohttp', verified: false, status: 'PATTERN', description: 'Asynchronous HTTP client/server', icon: getIcon('aiohttp') },
      { name: 'Falcon', verified: false, status: 'PATTERN', description: 'Reliable high-performance APIs', icon: getIcon('Falcon') },
      { name: 'Sanic', verified: false, status: 'PATTERN', description: 'Async Python web server', icon: getIcon('Sanic') },
    ],
  },
  {
    language: 'Go',
    frameworks: [
      { name: 'Gin', verified: false, status: 'PATTERN', description: 'Fast HTTP web framework', icon: getIcon('Gin') },
      { name: 'Echo', verified: false, status: 'PATTERN', description: 'High performance, minimalist framework', icon: getIcon('Echo') },
      { name: 'Fiber', verified: false, status: 'PATTERN', description: 'Express inspired web framework', icon: getIcon('Fiber') },
      { name: 'Chi', verified: false, status: 'PATTERN', description: 'Lightweight, idiomatic router', icon: getIcon('Chi') },
      { name: 'HttpRouter', verified: false, status: 'PATTERN', description: 'High performance HTTP request router', icon: getIcon('HttpRouter') },
      { name: 'Gorilla Mux', verified: false, status: 'PATTERN', description: 'Powerful URL router and dispatcher', icon: getIcon('Gorilla Mux') },
      { name: 'Go stdlib', verified: false, status: 'PATTERN', description: 'Standard net/http library', icon: getIcon('Go stdlib') },
    ],
  },
  {
    language: 'Java/Kotlin',
    frameworks: [
      { name: 'Spring Boot', verified: false, status: 'PATTERN', description: 'Stand-alone, production-grade Spring', icon: getIcon('Spring Boot') },
      { name: 'Quarkus', verified: false, status: 'PATTERN', description: 'Supersonic Subatomic Java', icon: getIcon('Quarkus') },
      { name: 'Micronaut', verified: false, status: 'PATTERN', description: 'Modern, JVM-based, full-stack framework', icon: getIcon('Micronaut') },
    ],
  },
  {
    language: 'PHP',
    frameworks: [
      { name: 'Laravel', verified: false, status: 'PATTERN', description: 'The PHP framework for web artisans', icon: getIcon('Laravel') },
      { name: 'Slim', verified: false, status: 'PATTERN', description: 'PHP micro framework', icon: getIcon('Slim') },
      { name: 'Symfony', verified: false, status: 'PATTERN', description: 'Reusable PHP components', icon: getIcon('Symfony') },
      { name: 'CakePHP', verified: false, status: 'PATTERN', description: 'Rapid development framework', icon: getIcon('CakePHP') },
    ],
  },
  {
    language: 'Ruby',
    frameworks: [
      { name: 'Rails', verified: false, status: 'PATTERN', description: 'Web application framework', icon: getIcon('Rails') },
      { name: 'Sinatra', verified: false, status: 'PATTERN', description: 'DSL for quickly creating web applications', icon: getIcon('Sinatra') },
      { name: 'Grape', verified: false, status: 'PATTERN', description: 'REST-like API framework', icon: getIcon('Grape') },
    ],
  },
  {
    language: 'Rust',
    frameworks: [
      { name: 'Actix Web', verified: false, status: 'PATTERN', description: 'Powerful, pragmatic, and extremely fast', icon: getIcon('Actix Web') },
      { name: 'Axum', verified: false, status: 'PATTERN', description: 'Ergonomic and modular web framework', icon: getIcon('Axum') },
      { name: 'Rocket', verified: false, status: 'PATTERN', description: 'Web framework for Rust that makes it simple', icon: getIcon('Rocket') },
      { name: 'Warp', verified: false, status: 'PATTERN', description: 'Super-easy, composable, web server framework', icon: getIcon('Warp') },
      { name: 'Poem', verified: false, status: 'PATTERN', description: 'Full-featured and easy-to-use web framework', icon: getIcon('Poem') },
    ],
  },
  {
    language: 'C#/.NET',
    frameworks: [
      { name: 'ASP.NET Core', verified: false, status: 'PATTERN', description: 'Cross-platform framework for modern cloud apps', icon: getIcon('ASP.NET Core') }
    ],
  },
]
