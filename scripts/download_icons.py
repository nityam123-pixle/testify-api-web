import os
import urllib.request
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

frameworks = {
    'NestJS': 'nestjs',
    'Next.js': 'nextdotjs',
    'Express': 'express',
    'Fastify': 'fastify',
    'Hono': 'hono',
    'Koa': 'koa',
    'AdonisJS': 'adonisjs',
    'Sails.js': 'sailsdotjs',
    'Restify': 'npm', # generic fallback
    'Hapi.js': 'hapi',
    'Polka': 'npm', # generic
    'Feathers': 'feathersjs',
    'ts-rest': 'typescript',
    'tRPC': 'trpc',
    'Elysia': 'bun',
    'FastAPI': 'fastapi',
    'Flask': 'flask',
    'Django': 'django',
    'Litestar': 'python',
    'Tornado': 'python',
    'aiohttp': 'python',
    'Falcon': 'python',
    'Sanic': 'python',
    'Gin': 'go',
    'Echo': 'go',
    'Fiber': 'go',
    'Chi': 'go',
    'HttpRouter': 'go',
    'Gorilla Mux': 'go',
    'Go stdlib': 'go',
    'Spring Boot': 'springboot',
    'Quarkus': 'quarkus',
    'Micronaut': 'micronaut',
    'Laravel': 'laravel',
    'Slim': 'php',
    'Symfony': 'symfony',
    'CakePHP': 'cakephp',
    'Rails': 'rubyonrails',
    'Sinatra': 'ruby',
    'Grape': 'ruby',
    'Actix Web': 'rust',
    'Axum': 'rust',
    'Rocket': 'rust',
    'Warp': 'rust',
    'Poem': 'rust',
    'ASP.NET Core': 'dotnet'
}

dest_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'icons', 'frameworks')
os.makedirs(dest_dir, exist_ok=True)

for fw, icon in frameworks.items():
    safe_name = fw.lower().replace('.', '').replace(' ', '-') + '.svg'
    # we omit /white to get the official brand color, except for black logos that hide on dark mode
    if icon in ['nextdotjs', 'express', 'adonisjs', 'flask', 'sanic', 'actix-web', 'koa']:
        url = f"https://cdn.simpleicons.org/{icon}/white"
    else:
        url = f"https://cdn.simpleicons.org/{icon}"
    out_path = os.path.join(dest_dir, safe_name)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response, open(out_path, 'wb') as out_file:
            out_file.write(response.read())
        print(f"Downloaded {fw} -> {safe_name}")
    except Exception as e:
        print(f"Failed to download {fw}: {e}")
