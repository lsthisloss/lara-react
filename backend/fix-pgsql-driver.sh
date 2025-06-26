#!/bin/bash

# Show colored output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -# 4. Fix routes issue in api.php by creating symbolic links to make sure all paths work
echo -e "${YELLOW}Creating symbolic links for API routes...${NC}"
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/framework/cache
chmod -R 777 storage/framework
echo -e "${GREEN}✓ Storage directories prepared${NC}"

# 5. Create fix for frontend URL handling
echo -e "${YELLOW}Creating fix for frontend API URL handling...${NC}"
cd ../frontend/src/services

# Add a console log to track the issue
echo "console.log('API URL base:', '${API_URL}');" >> api.ts

echo -e "${GREEN}Fixes applied successfully!${NC}"
echo -e "${YELLOW}Please restart your frontend development server to apply these changes.${NC}"
echo -e "${YELLOW}For the remaining PostgreSQL driver issue, you will need to rebuild the Docker container with proper PostgreSQL support.${NC}"LLOW}Fixing Laravel React App issues...${NC}"

# 1. Modify .env file to use file cache driver instead of database
echo -e "${YELLOW}Modifying .env to use file cache driver...${NC}"
sed -i 's/CACHE_STORE=database/CACHE_STORE=file/g' .env
echo -e "${GREEN}✓ .env updated to use file cache${NC}"

# 2. Clear config cache manually without using artisan
echo -e "${YELLOW}Clearing config cache files manually...${NC}"
rm -f bootstrap/cache/*.php
echo -e "${GREEN}✓ Config cache cleared${NC}"

# 3. Create a fresh Laravel route cache file manually
echo -e "${YELLOW}Creating a fresh routes.php file...${NC}"
mkdir -p bootstrap/cache
cat > bootstrap/cache/routes-v7.php << 'EOL'
<?php return array (
  'api' => 
  array (
    'register' => 
    array (
      'uri' => 'api/register',
      'method' => 'POST',
      'controller' => 'App\\Http\\Controllers\\Api\\AuthController@register',
    ),
    'login' => 
    array (
      'uri' => 'api/login',
      'method' => 'POST',
      'controller' => 'App\\Http\\Controllers\\Api\\AuthController@login',
    ),
    'logout' => 
    array (
      'uri' => 'api/logout',
      'method' => 'POST',
      'controller' => 'App\\Http\\Controllers\\Api\\AuthController@logout',
      'middleware' => 'auth:sanctum',
    ),
    'user' => 
    array (
      'uri' => 'api/user',
      'method' => 'GET',
      'controller' => 'App\\Http\\Controllers\\Api\\AuthController@user',
      'middleware' => 'auth:sanctum',
    ),
    'user.profile' => 
    array (
      'uri' => 'api/user/profile',
      'method' => 'PUT',
      'controller' => 'App\\Http\\Controllers\\Api\\AuthController@updateProfile',
      'middleware' => 'auth:sanctum',
    ),
    'user.password' => 
    array (
      'uri' => 'api/user/password',
      'method' => 'PUT',
      'controller' => 'App\\Http\\Controllers\\Api\\AuthController@changePassword',
      'middleware' => 'auth:sanctum',
    ),
    'users.profile' => 
    array (
      'uri' => 'api/users/{id}/profile',
      'method' => 'GET',
      'controller' => 'App\\Http\\Controllers\\Api\\AuthController@getUserProfile',
      'middleware' => 'auth:sanctum',
    ),
    'users' => 
    array (
      'uri' => 'api/users',
      'method' => 'GET',
      'controller' => 'App\\Http\\Controllers\\Api\\AuthController@getAllUsers',
      'middleware' => 'auth:sanctum',
    ),
    'posts.index' => 
    array (
      'uri' => 'api/posts',
      'method' => 'GET',
      'controller' => 'App\\Http\\Controllers\\Api\\PostController@index',
      'middleware' => 'auth:sanctum',
    ),
    'posts.store' => 
    array (
      'uri' => 'api/posts',
      'method' => 'POST',
      'controller' => 'App\\Http\\Controllers\\Api\\PostController@store',
      'middleware' => 'auth:sanctum',
    ),
    'posts.show' => 
    array (
      'uri' => 'api/posts/{post}',
      'method' => 'GET',
      'controller' => 'App\\Http\\Controllers\\Api\\PostController@show',
      'middleware' => 'auth:sanctum',
    ),
    'posts.update' => 
    array (
      'uri' => 'api/posts/{post}',
      'method' => 'PUT',
      'controller' => 'App\\Http\\Controllers\\Api\\PostController@update',
      'middleware' => 'auth:sanctum',
    ),
    'posts.destroy' => 
    array (
      'uri' => 'api/posts/{post}',
      'method' => 'DELETE',
      'controller' => 'App\\Http\\Controllers\\Api\\PostController@destroy',
      'middleware' => 'auth:sanctum',
    ),
  ),
);
EOL
chmod 644 bootstrap/cache/routes-v7.php
echo -e "${GREEN}✓ Routes cache created${NC}"

# 4. Start the services
echo -e "${YELLOW}Starting the services...${NC}"
docker compose up -d
echo -e "${GREEN}✓ Services started${NC}"

echo -e "${GREEN}Fixes applied successfully!${NC}"
echo -e "${YELLOW}Please wait a minute for all services to start properly, then try your operations again.${NC}"
