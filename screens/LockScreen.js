import React, { useState } from 'react';
import PinCodeComponent from '../components/PinCode';
const LockScreen = () => {
  return (
      <PinCodeComponent mode="setup" onSuccess={() => console.log('PIN Set!')} />
    
    );
}

export default LockScreen;