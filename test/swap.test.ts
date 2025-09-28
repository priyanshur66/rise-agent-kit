// Simple import test
const testImports = async () => {
  console.log('🧪 Testing imports...');

  try {
    // Try to import the modules
    const { swapExactTokensForTokens } = await import('../src/tools/citrea/swapOperations.js');
    const { setCurrentPrivateKey } = await import('../src/core/client.js');

    console.log('✅ Imports successful!');
    console.log('swapExactTokensForTokens function:', typeof swapExactTokensForTokens);
    console.log('setCurrentPrivateKey function:', typeof setCurrentPrivateKey);

  } catch (error) {
    console.log('❌ Import test failed:', error.message);
    console.log('Error details:', error);
  }
};

testImports();
