// This is a catch-all API route that will pass requests to MSW in development
// In development, requests should be intercepted by MSW
// In production, this would be your real API implementation

export async function GET(request: Request) {
  // Extract the URL for debugging
  const url = new URL(request.url);
  console.log('API route hit:', url.pathname, url.search);
  
  // In development, MSW should intercept this before it reaches here
  // If we're here, MSW is not working properly
  return new Response(
    JSON.stringify({ 
      error: 'API endpoint not found', 
      path: url.pathname,
      message: 'MSW should handle this request in development' 
    }), 
    { 
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  console.log('API POST route hit:', url.pathname);
  
  return new Response(
    JSON.stringify({ 
      error: 'API endpoint not found', 
      path: url.pathname,
      message: 'MSW should handle this request in development' 
    }), 
    { 
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

export async function PUT(request: Request) {
  const url = new URL(request.url);
  console.log('API PUT route hit:', url.pathname);
  
  return new Response(
    JSON.stringify({ 
      error: 'API endpoint not found', 
      path: url.pathname,
      message: 'MSW should handle this request in development' 
    }), 
    { 
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  console.log('API DELETE route hit:', url.pathname);
  
  return new Response(
    JSON.stringify({ 
      error: 'API endpoint not found', 
      path: url.pathname,
      message: 'MSW should handle this request in development' 
    }), 
    { 
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
