# Build the theme's Tailwind CSS
build-css:
    bun --filter starlight-theme-celestia build

# Start the demo website dev server
dev: build-css
    bun --filter starlight-theme-celestia-website dev

# Build the demo website for production
build: build-css
    bun --filter starlight-theme-celestia-website build

# Preview the production build
preview: build
    bun --filter starlight-theme-celestia-website preview

# Install dependencies
install:
    bun install

# Run all linters
lint:
    prek run --all-files

# Format all files with prettier
fmt:
    bunx prettier --write .
