import { useRef, useEffect } from "react";
import { useSpring, animated, to } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import { Button } from "@/components/ui/button";

interface AnimatedButtonProps {
  title: string;
  handleFunc: () => {};
}

const calcX = (y: number, ly: number) =>
  -(y - ly - window.innerHeight / 2) / 20;
const calcY = (x: number, lx: number) => (x - lx - window.innerWidth / 2) / 20;

const wheel = (y: number) => {
  const imgHeight = window.innerWidth * 0.3 - 20;
  return `translateY(${-imgHeight * (y < 0 ? 6 : 1) - (y % (imgHeight * 5))}px`;
};

const AnimatedButton = ({ title, handleFunc }: AnimatedButtonProps) => {
  useEffect(() => {
    const preventDefault = (e: Event) => e.preventDefault();
    document.addEventListener("gesturestart", preventDefault);
    document.addEventListener("gesturechange", preventDefault);

    return () => {
      document.removeEventListener("gesturestart", preventDefault);
      document.removeEventListener("gesturechange", preventDefault);
    };
  }, []);
  const target = useRef(null);
  const [{ x, y, rotateX, rotateY, rotateZ, zoom, scale }, api] = useSpring(
    () => ({
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      scale: 1,
      zoom: 0,
      x: 0,
      y: 0,
      config: { mass: 5, tension: 350, friction: 40 },
    })
  );
  const [{ wheelY }, wheelApi] = useSpring(() => ({ wheelY: 0 }));

  useGesture(
    {
      //   onDrag: ({ active, offset: [x, y] }) =>
      //     api({ x, y, rotateX: 0, rotateY: 0, scale: active ? 1 : 1.1 }),
      onPinch: ({ offset: [d, a] }) => api({ zoom: d / 200, rotateZ: a }),
      onMove: ({ xy: [px, py], dragging }) =>
        !dragging &&
        api({
          rotateX: calcX(py, y.get()),
          rotateY: calcY(px, x.get()),
          scale: 1.1,
        }),
      onHover: ({ hovering }) =>
        !hovering && api({ rotateX: 0, rotateY: 0, scale: 1 }),
      onWheel: ({ event, offset: [, y] }) => {
        event.preventDefault();
        wheelApi.set({ wheelY: y });
      },
    },
    { target, eventOptions: { passive: false } }
  );
  return (
    <animated.div
      ref={target}
      className="relative w-full h-[200px] rounded-md bg-white shadow-md transition-shadow-opacity will-change-transform border-4 border-sky-950 cursor-grab overflow-hidden touch-action-none hover:shadow-2xl"
      style={{
        transform: "perspective(600px)",
        x,
        y,
        scale: to([scale, zoom], (s, z) => s + z),
        rotateX,
        rotateY,
        rotateZ,
      }}
    >
      <Button className="w-full h-full text-lg" onClick={handleFunc}>{title}</Button>
    </animated.div>
  );
};

export default AnimatedButton;
