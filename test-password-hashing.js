const bcrypt = require('bcryptjs');

async function testPasswordHashing() {
  console.log('🔐 Testing Password Hashing...\n');

  const plainPassword = 'testPassword123';
  
  // Test 1: Hash a password
  console.log('1. Hashing password...');
  const hashedPassword = await bcrypt.hash(plainPassword, 12);
  console.log(`Plain: ${plainPassword}`);
  console.log(`Hashed: ${hashedPassword}`);
  console.log(`Is different: ${plainPassword !== hashedPassword ? '✅' : '❌'}\n`);

  // Test 2: Verify correct password
  console.log('2. Testing correct password validation...');
  const isValidCorrect = await bcrypt.compare(plainPassword, hashedPassword);
  console.log(`Correct password validates: ${isValidCorrect ? '✅' : '❌'}\n`);

  // Test 3: Verify incorrect password
  console.log('3. Testing incorrect password validation...');
  const isValidIncorrect = await bcrypt.compare('wrongPassword', hashedPassword);
  console.log(`Incorrect password rejects: ${!isValidIncorrect ? '✅' : '❌'}\n`);

  console.log('🎉 Password hashing test complete!');
}

testPasswordHashing().catch(console.error); 