# Local-First Todo PWA

A local-first Progressive Web App for task management, built with CRDT-based state management, RDF semantic data model, and optional Solid Pod synchronization.

## Features

- **Local-First Architecture**: Fully usable upon visiting, no internet connection or user account required
- **Conflict-Free Replication**: Uses Y.js CRDTs for automatic conflict resolution
- **Semantic Data Model**: Tasks stored as RDF triples following semantic web standards
- **Offline Support**: Complete PWA with service worker for offline functionality
- **Anonymous by Default**: No authentication needed to use the app
- **Optional Sync**: Connect to your self-hosted Solid Pod for backup and cross-device sync
- **Simple Interface**: Only two actions - add tasks and toggle completion

## Architecture

This project follows **Onion Architecture** (Domain-Driven Design) with clear separation of concerns:

```
src/
├── domain/              # Core business logic, RDF vocabularies, entities
│   ├── task.ts          # Task entity and factory
│   ├── vocabularies.ts  # RDF vocabulary definitions
│   └── rdf-mapper.ts    # RDF ↔ Task conversion
├── application/         # Use cases, CRDT state management
│   ├── crdt-store.ts    # Y.js-based CRDT store
│   ├── task-service.ts  # Application services
│   └── app-context.ts   # Application initialization
├── infrastructure/      # External concerns (persistence, sync)
│   ├── indexeddb-persistence.ts  # Local IndexedDB storage
│   └── solid-sync.ts    # Solid Pod synchronization
└── ui/                  # User interface
    ├── app.ts           # Main UI component
    └── styles.css       # Styling
```

### Key Technologies

- **TypeScript**: Type-safe development
- **Y.js**: CRDT implementation for conflict-free replication
- **RDFLib.js**: RDF triple store and semantic web support
- **Solid Client**: Integration with Solid Pods
- **Vite**: Fast build tooling and dev server
- **Vitest**: Unit testing framework
- **IndexedDB**: Local persistence via y-indexeddb

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm 10.x or later

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment

This project is configured for automatic deployment to GitHub Pages. See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

**Quick deploy to GitHub Pages:**
1. Push your code to GitHub
2. Enable GitHub Pages with source "GitHub Actions" in repository settings
3. Update `.github/workflows/deploy.yml` with your repository name
4. Push to main branch - deployment happens automatically!

Your app will be live at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

### Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm test:ui

# Type checking
npm run type-check
```

## Usage

### Basic Task Management

1. **Add a Task**: Type in the input field and click "Add" or press Enter
2. **Complete a Task**: Click the checkbox next to a task to mark it complete
3. **View Tasks**: All tasks are displayed in reverse chronological order

### Solid Pod Sync (Optional)

To enable synchronization across devices:

1. Enter your Solid Pod URL (e.g., `https://your-pod.solidcommunity.net`)
2. Click "Login" to authenticate with your Solid Pod provider
3. Click "Sync Now" to push your local tasks to your Solid Pod
4. Your tasks will be stored as RDF triples in your Pod at `/tasks`

**Note**: You remain anonymous until you choose to login. The app is fully functional without any Solid Pod connection.

## RDF Data Model

Tasks are represented as RDF triples using a custom TODO vocabulary:

```turtle
@prefix todo: <http://example.org/todo#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<#task-123> a todo:PendingTask ;
    todo:id "task-123" ;
    todo:title "Buy groceries" ;
    todo:completed false ;
    dcterms:created "2026-02-06T12:00:00Z"^^xsd:dateTime ;
    dcterms:modified "2026-02-06T12:00:00Z"^^xsd:dateTime .
```

## CRDT Synchronization

The app uses Y.js for CRDT-based state management, ensuring that:

- Multiple browser tabs automatically stay in sync
- Concurrent modifications merge without conflicts
- The last-write-wins semantics apply for field-level updates
- State changes are persisted to IndexedDB immediately

## Offline Support

The application works completely offline:

- All data is stored locally in IndexedDB
- Service worker caches application assets
- PWA manifest enables "Add to Home Screen"
- Sync happens only when online and configured

## Development

### Project Structure

```
todo_local-first_pwa/
├── src/
│   ├── domain/          # Domain layer (business logic)
│   ├── application/     # Application layer (use cases)
│   ├── infrastructure/  # Infrastructure layer (persistence, sync)
│   ├── ui/              # Presentation layer
│   └── main.ts          # Application entry point
├── public/              # Static assets
├── index.html           # HTML entry point
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Project dependencies
```

### Adding Features

When adding new features, follow the onion architecture:

1. **Domain Layer**: Define entities, value objects, and domain services
2. **Application Layer**: Implement use cases and application services
3. **Infrastructure Layer**: Add persistence, external services
4. **UI Layer**: Create user interface components

### Testing Philosophy

- All business logic must have unit tests
- Each layer is tested independently
- Tests prove correctness of implementations
- Aim for high test coverage

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 11.3+)
- All modern browsers with IndexedDB and Service Worker support

## Security Considerations

- No server-side authentication or user tracking
- Data stored locally in browser's IndexedDB
- Solid Pod authentication uses OAuth 2.0/OIDC
- All Solid communication over HTTPS

## License

MIT

## Contributing

Contributions are welcome! Please follow the established architecture patterns and ensure all tests pass before submitting.

## Credits

Built with:
- [Y.js](https://github.com/yjs/yjs) - CRDT framework
- [RDFLib.js](https://github.com/linkeddata/rdflib.js) - RDF library
- [Solid](https://solidproject.org/) - Decentralized web platform
- [Vite](https://vitejs.dev/) - Build tooling
