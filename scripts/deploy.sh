#!/bin/bash
# Deployment Script for Taya's Real Estate Dashboard

set -e

echo "🚀 Deploying Taya's Real Estate Dashboard"
echo "======================================="

# Configuration
PROJECT_NAME="taya-realestate-dashboard"
VERCEL_PROJECT_NAME="taya-realestate-dashboard"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warn() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Check prerequisites
check_dependencies() {
    log "Checking dependencies..."
    
    local deps=(git node npm vercel)
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            error "Missing dependency: $dep"
            exit 1
        fi
    done
    
    success "All dependencies found"
}

# Setup environment variables
setup_environment() {
    log "Setting up environment variables..."
    
    if [[ ! -f ".env.local" ]]; then
        if [[ -f ".env.example" ]]; then
            cp .env.example .env.local
            warn "Created .env.local from .env.example"
            warn "Please update .env.local with your actual API keys and configurations"
        else
            error "No .env.example file found"
            exit 1
        fi
    else
        success "Environment file already exists"
    fi
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    cd web
    npm install
    cd ..
    
    success "Dependencies installed"
}

# Build the project
build_project() {
    log "Building project..."
    
    cd web
    npm run build
    cd ..
    
    success "Project built successfully"
}

# Deploy to Vercel
deploy_to_vercel() {
    log "Deploying to Vercel..."
    
    # Check if already linked to a project
    if [[ ! -f ".vercel/project.json" ]]; then
        warn "Project not linked to Vercel. Linking now..."
        vercel link --yes
    fi
    
    # Deploy
    if [[ "$1" == "production" ]]; then
        log "Deploying to production..."
        vercel --prod
    else
        log "Deploying to preview..."
        vercel
    fi
    
    success "Deployment completed"
}

# Setup MongoDB Atlas (placeholder)
setup_mongodb() {
    log "MongoDB Atlas setup..."
    warn "Please ensure your MongoDB Atlas cluster is configured manually"
    warn "1. Create cluster: taya-realestate-cluster"
    warn "2. Create database: taya-realestate"
    warn "3. Create collections: properties, propertyowners, actionitems, analytics"
    warn "4. Setup network access and database user"
    warn "5. Add connection string to .env.local"
}

# Setup Clerk Authentication (placeholder)
setup_clerk() {
    log "Clerk Authentication setup..."
    warn "Please configure Clerk manually:"
    warn "1. Create application at https://clerk.dev"
    warn "2. Configure sign-in/sign-up pages"
    warn "3. Add API keys to .env.local"
    warn "4. Configure redirect URLs for your domain"
}

# Main deployment flow
main() {
    echo
    log "Starting deployment process..."
    
    # Parse arguments
    local env="preview"
    if [[ "$1" == "production" || "$1" == "prod" ]]; then
        env="production"
    fi
    
    check_dependencies
    setup_environment
    install_dependencies
    
    # Only build and deploy if environment is properly configured
    if [[ -f ".env.local" ]]; then
        build_project
        deploy_to_vercel "$env"
    else
        error "Environment not configured. Please setup .env.local first."
        exit 1
    fi
    
    # Information for manual setup
    echo
    echo "📋 Manual Setup Required:"
    echo "========================="
    setup_mongodb
    echo
    setup_clerk
    
    echo
    success "Deployment script completed!"
    echo
    echo "📝 Next Steps:"
    echo "1. Configure MongoDB Atlas and update MONGODB_URI in .env.local"
    echo "2. Setup Clerk authentication and update API keys"
    echo "3. Configure other API keys (OpenAI, Google Maps, etc.)"
    echo "4. Run data migration scripts to populate initial data"
    echo "5. Test the application and customize for Taya's specific needs"
    echo
    echo "🌐 Your dashboard will be available at:"
    echo "https://taya-realestate-dashboard.vercel.app"
    echo
}

# Show usage
usage() {
    cat << EOF
Usage: $0 [environment]

Environments:
    preview     Deploy to preview environment (default)
    production  Deploy to production environment

Examples:
    $0              # Deploy to preview
    $0 preview      # Deploy to preview  
    $0 production   # Deploy to production

EOF
}

# Handle arguments
case "$1" in
    -h|--help)
        usage
        exit 0
        ;;
    *)
        main "$1"
        ;;
esac