import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDefaultPort(framework?: string): string {
  switch (framework) {
    case 'FastAPI':
    case 'Django':
    case 'Laravel':
    case 'Symfony':
    case 'Sanic':
    case 'Falcon':
      return '8000'
    case 'Flask':
    case 'ASP.NET Core':
      return '5000'
    case 'Spring Boot':
    case 'Quarkus':
    case 'Micronaut':
    case 'Gin':
    case 'Echo':
    case 'Chi':
    case 'Go stdlib':
    case 'Restify':
    case 'aiohttp':
    case 'Actix Web':
      return '8080'
    case 'AdonisJS':
      return '3333'
    case 'Sails.js':
      return '1337'
    case 'CakePHP':
      return '8765'
    case 'Sinatra':
      return '4567'
    case 'Grape':
      return '9292'
    case 'Tornado':
      return '8888'
    case 'Next.js':
    case 'NestJS':
    case 'Express':
    case 'Fastify':
    case 'Hono':
    case 'Elysia':
    case 'Fiber':
    case 'Rails':
    case 'Axum':
    default:
      return '3000'
  }
}

export function extractPathParams(url: string): string[] {
  const params = new Set<string>()
  
  // Match :id
  const colonMatches = url.match(/:([a-zA-Z0-9_]+)/g)
  if (colonMatches) {
    colonMatches.forEach(m => params.add(m.slice(1))) // remove :
  }
  
  // Match {id}
  const braceMatches = url.match(/\{([a-zA-Z0-9_]+)\}/g)
  if (braceMatches) {
    braceMatches.forEach(m => params.add(m.slice(1, -1))) // remove {}
  }
  
  // Match [id]
  const bracketMatches = url.match(/\[([a-zA-Z0-9_]+)\]/g)
  if (bracketMatches) {
    bracketMatches.forEach(m => params.add(m.slice(1, -1))) // remove []
  }

  // Filter out any port numbers (e.g. localhost:3000 matching :3000 if someone named their param with numbers)
  // Actually, port number matches `:\d+`, so let's filter out purely numeric matches from colonMatches
  return Array.from(params).filter(p => isNaN(Number(p)))
}


