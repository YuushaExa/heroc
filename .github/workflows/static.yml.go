name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]  # Change this to your default branch if it's different
  workflow_dispatch:  # Allows manual triggering

permissions:
  contents: read  # Allow reading repository contents
  pages: write    # Allow writing to GitHub Pages
  id-token: write # Required for GitHub Pages deployment

concurrency:
  group: "pages"
  cancel-in-progress: true  # Cancel any in-progress deployments

jobs:
 
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
      with:
        submodules: recursive
        fetch-depth: 1  # Fetch all history for better git log and changelog

    - name: Set up Go
      uses: actions/setup-go@v5
      with:
        go-version: '1.23.2'
        
    - name: Cache Go modules
      uses: actions/cache@v4
      with:
        path: |
          ~/.cache/go-build
          ~/go/pkg/mod
        key: ${{ runner.os }}-go-${{ hashFiles('**/*.go') }}
        restore-keys: |
          ${{ runner.os }}-go-

    - name: Download Go modules
      run: go mod download

    - name: Build static site
      run: |
        go build -o ssg
        ./ssg
        
    - name: Setup Pages
      id: pages
      uses: actions/configure-pages@v5
      
    - name: Upload artifact
      uses: actions/upload-pages-artifact@v3
      with:
        path: ./public

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    
    steps:
    - name: Deploy to GitHub Pages
      id: deployment
      uses: actions/deploy-pages@v4