# Build the theme's Tailwind CSS
build-css:
    bun --filter starlight-celestia-theme build

# Start the demo website dev server
dev: build-css
    bun --filter starlight-celestia-theme-website dev

# Build the demo website for production
build: build-css
    bun --filter starlight-celestia-theme-website build

# Preview the production build
preview: build
    bun --filter starlight-celestia-theme-website preview

# Install dependencies
install:
    bun install

# Run all linters
lint:
    prek run --all-files

# Format all files with prettier
fmt:
    bunx prettier --write .
