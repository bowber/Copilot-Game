import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, cleanup, fireEvent } from '@solidjs/testing-library';
import MobileControls, {
  VirtualJoystick,
  MobileControlButtons,
} from './MobileControls';
import { InputManager } from './GameTypes';

// Mock InputManager
class MockInputManager extends InputManager {
  handleVirtualKey = vi.fn().mockReturnValue(true);
}

describe('MobileControls', () => {
  let mockInputManager: MockInputManager;

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockInputManager = new MockInputManager();
  });

  describe('VirtualJoystick', () => {
    it('renders with correct size', () => {
      render(() => (
        <VirtualJoystick inputManager={mockInputManager} size={100} />
      ));

      const joystick = document.querySelector(
        '.virtual-joystick'
      ) as HTMLElement;
      expect(joystick).toBeTruthy();
      expect(joystick.style.width).toBe('100px');
      expect(joystick.style.height).toBe('100px');
    });

    it('renders with default size when no size prop provided', () => {
      render(() => <VirtualJoystick inputManager={mockInputManager} />);

      const joystick = document.querySelector(
        '.virtual-joystick'
      ) as HTMLElement;
      expect(joystick).toBeTruthy();
      expect(joystick.style.width).toBe('120px');
      expect(joystick.style.height).toBe('120px');
    });

    it('has proper knob size relative to joystick size', () => {
      render(() => (
        <VirtualJoystick inputManager={mockInputManager} size={100} />
      ));

      const knob = document.querySelector(
        '.virtual-joystick-knob'
      ) as HTMLElement;
      expect(knob).toBeTruthy();
      // Knob should be 40% of joystick size
      expect(knob.style.width).toBe('40px');
      expect(knob.style.height).toBe('40px');
    });

    it('handles mouse interactions', () => {
      render(() => <VirtualJoystick inputManager={mockInputManager} />);

      const joystick = document.querySelector(
        '.virtual-joystick'
      ) as HTMLElement;
      expect(joystick).toBeTruthy();

      // Mock getBoundingClientRect to return predictable values
      vi.spyOn(joystick, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 120,
        height: 120,
        right: 120,
        bottom: 120,
        x: 0,
        y: 0,
        toJSON: () => {},
      });

      fireEvent.mouseDown(joystick, { clientX: 80, clientY: 60 });

      // Should send input to InputManager when dragged sufficiently
      expect(mockInputManager.handleVirtualKey).toHaveBeenCalled();
    });

    it('handles touch interactions', () => {
      render(() => <VirtualJoystick inputManager={mockInputManager} />);

      const joystick = document.querySelector(
        '.virtual-joystick',
      ) as HTMLElement;
      expect(joystick).toBeTruthy();

      // Mock getBoundingClientRect
      vi.spyOn(joystick, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 120,
        height: 120,
        right: 120,
        bottom: 120,
        x: 0,
        y: 0,
        toJSON: () => {},
      });

      // Simulate touch event using fireEvent.touchStart
      fireEvent.touchStart(joystick, {
        touches: [{ clientX: 80, clientY: 60 }],
      });

      // Should handle touch input
      expect(mockInputManager.handleVirtualKey).toHaveBeenCalled();
    });
  });

  describe('MobileControlButtons', () => {
    it('renders all required buttons', () => {
      render(() => <MobileControlButtons inputManager={mockInputManager} />);

      const buttons = document.querySelectorAll('.mobile-control-btn');
      expect(buttons).toHaveLength(3);

      const inventoryBtn = document.querySelector('.inventory-btn');
      const shopBtn = document.querySelector('.shop-btn');
      const helpBtn = document.querySelector('.help-btn');

      expect(inventoryBtn).toBeTruthy();
      expect(shopBtn).toBeTruthy();
      expect(helpBtn).toBeTruthy();
    });

    it('sends correct key events when buttons are pressed', () => {
      render(() => <MobileControlButtons inputManager={mockInputManager} />);

      const inventoryBtn = document.querySelector(
        '.inventory-btn'
      ) as HTMLElement;
      const shopBtn = document.querySelector('.shop-btn') as HTMLElement;
      const helpBtn = document.querySelector('.help-btn') as HTMLElement;

      fireEvent.click(inventoryBtn);
      expect(mockInputManager.handleVirtualKey).toHaveBeenCalledWith(
        'KeyI',
        true
      );

      fireEvent.click(shopBtn);
      expect(mockInputManager.handleVirtualKey).toHaveBeenCalledWith(
        'KeyT',
        true
      );

      fireEvent.click(helpBtn);
      expect(mockInputManager.handleVirtualKey).toHaveBeenCalledWith(
        'KeyH',
        true
      );
    });

    it('has proper accessibility attributes', () => {
      render(() => <MobileControlButtons inputManager={mockInputManager} />);

      const inventoryBtn = document.querySelector(
        '.inventory-btn'
      ) as HTMLElement;
      const shopBtn = document.querySelector('.shop-btn') as HTMLElement;
      const helpBtn = document.querySelector('.help-btn') as HTMLElement;

      expect(inventoryBtn.getAttribute('title')).toBe('Inventory (I)');
      expect(shopBtn.getAttribute('title')).toBe('Shop (T)');
      expect(helpBtn.getAttribute('title')).toBe('Help (H)');
    });
  });

  describe('MobileControls', () => {
    it('shows controls when show prop is true', () => {
      render(() => (
        <MobileControls inputManager={mockInputManager} show={true} />
      ));

      const controls = document.querySelector('.mobile-controls');
      expect(controls).toBeTruthy();
      expect(controls?.classList.contains('visible')).toBe(true);
      expect(controls?.classList.contains('hidden')).toBe(false);
    });

    it('hides controls when show prop is false', () => {
      render(() => (
        <MobileControls inputManager={mockInputManager} show={false} />
      ));

      const controls = document.querySelector('.mobile-controls');
      expect(controls).toBeTruthy();
      expect(controls?.classList.contains('visible')).toBe(false);
      expect(controls?.classList.contains('hidden')).toBe(true);
    });

    it('contains both joystick and buttons', () => {
      render(() => (
        <MobileControls inputManager={mockInputManager} show={true} />
      ));

      const joystick = document.querySelector('.virtual-joystick');
      const buttons = document.querySelector('.mobile-control-buttons');

      expect(joystick).toBeTruthy();
      expect(buttons).toBeTruthy();
    });

    it('handles null input manager gracefully', () => {
      // Should not crash with null input manager
      expect(() => {
        render(() => <MobileControls inputManager={null} show={true} />);
      }).not.toThrow();

      const controls = document.querySelector('.mobile-controls');
      expect(controls).toBeTruthy();
    });
  });

  describe('CSS Classes and Styling', () => {
    it('applies correct CSS classes', () => {
      render(() => (
        <MobileControls inputManager={mockInputManager} show={true} />
      ));

      const controls = document.querySelector('.mobile-controls');
      const joystick = document.querySelector('.virtual-joystick');
      const knob = document.querySelector('.virtual-joystick-knob');
      const buttons = document.querySelector('.mobile-control-buttons');

      expect(controls?.className).toContain('mobile-controls');
      expect(joystick?.className).toContain('virtual-joystick');
      expect(knob?.className).toContain('virtual-joystick-knob');
      expect(buttons?.className).toContain('mobile-control-buttons');
    });
  });
});
