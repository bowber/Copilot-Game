import { Component, createSignal, onMount, onCleanup } from 'solid-js';
import { InputManager } from './GameTypes';

interface VirtualJoystickProps {
  inputManager: InputManager | null;
  size?: number;
}

interface MobileControlButtonsProps {
  inputManager: InputManager | null;
}

export const VirtualJoystick: Component<VirtualJoystickProps> = props => {
  const [isDragging, setIsDragging] = createSignal(false);
  const [knobPosition, setKnobPosition] = createSignal({ x: 0, y: 0 });
  const [currentInput, setCurrentInput] = createSignal<string | null>(null);

  // Get size with proper reactivity
  const getSize = () => props.size || 120;
  const getKnobSize = () => getSize() * 0.4;
  const getMaxDistance = () => (getSize() - getKnobSize()) / 2;

  let joystickRef: HTMLDivElement | undefined;
  let knobRef: HTMLDivElement | undefined;

  const getJoystickCenter = () => {
    if (!joystickRef) return { x: 0, y: 0 };
    const rect = joystickRef.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  };

  const updateKnobPosition = (clientX: number, clientY: number) => {
    const center = getJoystickCenter();
    let deltaX = clientX - center.x;
    let deltaY = clientY - center.y;

    // Limit to circle bounds
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDist = getMaxDistance();
    if (distance > maxDist) {
      deltaX = (deltaX / distance) * maxDist;
      deltaY = (deltaY / distance) * maxDist;
    }

    setKnobPosition({ x: deltaX, y: deltaY });

    // Convert to movement input
    const threshold = maxDist * 0.3; // 30% threshold for movement
    let newInput: string | null = null;

    if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
      // Determine primary direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        newInput = deltaX > 0 ? 'ArrowRight' : 'ArrowLeft';
      } else {
        newInput = deltaY > 0 ? 'ArrowDown' : 'ArrowUp';
      }
    }

    // Send input events to game
    const prevInput = currentInput();
    if (prevInput !== newInput) {
      // Release previous key
      if (prevInput && props.inputManager) {
        props.inputManager.handleVirtualKey(prevInput, false);
      }

      // Press new key
      if (newInput && props.inputManager) {
        props.inputManager.handleVirtualKey(newInput, true);
      }

      setCurrentInput(newInput);
    }
  };

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    updateKnobPosition(clientX, clientY);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (isDragging()) {
      updateKnobPosition(clientX, clientY);
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
    setKnobPosition({ x: 0, y: 0 });

    // Release any active input
    const active = currentInput();
    if (active && props.inputManager) {
      props.inputManager.handleVirtualKey(active, false);
    }
    setCurrentInput(null);
  };

  // Mouse events
  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    e.preventDefault();
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = (e: MouseEvent) => {
    e.preventDefault();
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    handleEnd();
  };

  onMount(() => {
    // Add global event listeners for drag operations
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  });

  onCleanup(() => {
    // Cleanup event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);

    // Release any active input
    const active = currentInput();
    if (active && props.inputManager) {
      props.inputManager.handleVirtualKey(active, false);
    }
  });

  return (
    <div
      ref={joystickRef}
      class="virtual-joystick"
      style={{
        width: `${getSize()}px`,
        height: `${getSize()}px`,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div
        ref={knobRef}
        class="virtual-joystick-knob"
        style={{
          width: `${getKnobSize()}px`,
          height: `${getKnobSize()}px`,
          transform: `translate(${knobPosition().x}px, ${knobPosition().y}px)`,
        }}
      />
    </div>
  );
};

export const MobileControlButtons: Component<
  MobileControlButtonsProps
> = props => {
  const handleButtonPress = (key: string) => {
    if (props.inputManager) {
      // Simulate key press and release
      props.inputManager.handleVirtualKey(key, true);
      setTimeout(() => {
        props.inputManager?.handleVirtualKey(key, false);
      }, 100);
    }
  };

  return (
    <div class="mobile-control-buttons">
      <button
        class="mobile-control-btn inventory-btn"
        onClick={() => handleButtonPress('KeyI')}
        title="Inventory (I)"
      >
        🎒
      </button>

      <button
        class="mobile-control-btn shop-btn"
        onClick={() => handleButtonPress('KeyT')}
        title="Shop (T)"
      >
        🏪
      </button>

      <button
        class="mobile-control-btn help-btn"
        onClick={() => handleButtonPress('KeyH')}
        title="Help (H)"
      >
        ❓
      </button>
    </div>
  );
};

interface MobileControlsProps {
  inputManager: InputManager | null;
  show: boolean;
}

export const MobileControls: Component<MobileControlsProps> = props => {
  return (
    <div class={`mobile-controls ${props.show ? 'visible' : 'hidden'}`}>
      <VirtualJoystick inputManager={props.inputManager} />
      <MobileControlButtons inputManager={props.inputManager} />
    </div>
  );
};

export default MobileControls;
