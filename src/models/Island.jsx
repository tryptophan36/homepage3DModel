/**
 * IMPORTANT: Loading glTF models into a Three.js scene is a lot of work.
 * Before we can configure or animate our model’s meshes, we need to iterate through
 * each part of our model’s meshes and save them separately.
 *
 * But luckily there is an app that turns gltf or glb files into jsx components
 * For this model, visit https://gltf.pmnd.rs/
 * And get the code. And then add the rest of the things.
 * YOU DON'T HAVE TO WRITE EVERYTHING FROM SCRATCH
 */

import { a } from "@react-spring/three";
import { useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";

import islandScene from "../assets/3d/indian_gazebo.glb";

export function Island({
  isRotating,
  setIsRotating,
  setCurrentStage,
  currentFocusPoint,
  ...props
}) {
  const islandRef = useRef();
  // Get access to the Three.js renderer and viewport
  const { gl, viewport } = useThree();
  const { nodes, materials,scene } = useGLTF(islandScene);

  // Use a ref for the last mouse x position
  const lastX = useRef(0);
  // Use a ref for rotation speed
  const rotationSpeed = useRef(0);
  // Define a damping factor to control rotation damping
  const dampingFactor = 0.95;

  // Handle pointer (mouse or touch) down event
  const handlePointerDown = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setIsRotating(true);

    // Calculate the clientX based on whether it's a touch event or a mouse event
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;

    // Store the current clientX position for reference
    lastX.current = clientX;
  };

  // Handle pointer (mouse or touch) up event
  const handlePointerUp = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setIsRotating(false);
  };

  // Handle pointer (mouse or touch) move event
  const handlePointerMove = (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (isRotating) {
      // If rotation is enabled, calculate the change in clientX position
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;

      // calculate the change in the horizontal position of the mouse cursor or touch input,
      // relative to the viewport's width
      const delta = (clientX - lastX.current) / viewport.width;

      // Update the island's rotation based on the mouse/touch movement
      islandRef.current.rotation.y += delta * 0.01 * Math.PI;

      // Update the reference for the last clientX position
      lastX.current = clientX;

      // Update the rotation speed
      rotationSpeed.current = delta * 0.01 * Math.PI;
    }
  };

  // Handle keydown events
  const handleKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      if (!isRotating) setIsRotating(true);

      islandRef.current.rotation.y += 0.005 * Math.PI;
      rotationSpeed.current = 0.007;
    } else if (event.key === "ArrowRight") {
      if (!isRotating) setIsRotating(true);

      islandRef.current.rotation.y -= 0.005 * Math.PI;
      rotationSpeed.current = -0.007;
    }
  };

  // Handle keyup events
  const handleKeyUp = (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      setIsRotating(false);
    }
  };

  useEffect(() => {
    // Add event listeners for pointer and keyboard events
    const canvas = gl.domElement;
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    if (materials && materials.material0) {
      // Set the color to red
      materials.material0.color.set("#fcd59b");
    }

    // Remove event listeners when component unmounts
    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gl, handlePointerDown, handlePointerUp, handlePointerMove]);

  // This function is called on each frame update
  useFrame(() => {
    // If not rotating, apply damping to slow down the rotation (smoothly)
    if (!isRotating) {
      // Apply damping factor
      rotationSpeed.current *= dampingFactor;

      // Stop rotation when speed is very small
      if (Math.abs(rotationSpeed.current) < 0.001) {
        rotationSpeed.current = 0;
      }

      islandRef.current.rotation.y += rotationSpeed.current;
    } else {
      // When rotating, determine the current stage based on island's orientation
      const rotation = islandRef.current.rotation.y;

      /**
       * Normalize the rotation value to ensure it stays within the range [0, 2 * Math.PI].
       * The goal is to ensure that the rotation value remains within a specific range to
       * prevent potential issues with very large or negative rotation values.
       *  Here's a step-by-step explanation of what this code does:
       *  1. rotation % (2 * Math.PI) calculates the remainder of the rotation value when divided
       *     by 2 * Math.PI. This essentially wraps the rotation value around once it reaches a
       *     full circle (360 degrees) so that it stays within the range of 0 to 2 * Math.PI.
       *  2. (rotation % (2 * Math.PI)) + 2 * Math.PI adds 2 * Math.PI to the result from step 1.
       *     This is done to ensure that the value remains positive and within the range of
       *     0 to 2 * Math.PI even if it was negative after the modulo operation in step 1.
       *  3. Finally, ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) applies another
       *     modulo operation to the value obtained in step 2. This step guarantees that the value
       *     always stays within the range of 0 to 2 * Math.PI, which is equivalent to a full
       *     circle in radians.
       */
      const normalizedRotation =
        ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

      // Set the current stage based on the island's orientation
      switch (true) {
        case normalizedRotation >= 5.45 && normalizedRotation <= 5.85:
          setCurrentStage(4);
          break;
        case normalizedRotation >= 0.85 && normalizedRotation <= 1.3:
          setCurrentStage(3);
          break;
        case normalizedRotation >= 2.4 && normalizedRotation <= 2.6:
          setCurrentStage(2);
          break;
        case normalizedRotation >= 4.25 && normalizedRotation <= 4.75:
          setCurrentStage(1);
          break;
        default:
          setCurrentStage(null);
      }
    }
  });

  return (
    // {Island 3D model from: https://sketchfab.com/3d-models/foxs-islands-163b68e09fcc47618450150be7785907}
    <a.group ref={islandRef} {...props} scale={[0.0005, 0.0005, 0.0005]}>
      {
        console.log("materials",materials.material_0)
        
      }
      {
        console.log("nodes",nodes)
      }
       <group rotation={[-Math.PI/2,0,-Math.PI/2]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Pole_low_material_0_0.geometry}
          material={materials.material_0}
          position={[11050, -13950, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.RailTop_low_material_0_0.geometry}
          material={materials.material_0}
          position={[0, -13000, 29166.779]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.RailPoleTop_low_material_0_0.geometry}
          material={materials.material_0}
          position={[0, -12763.676, 27366.779]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Base_low_material_0_0.geometry}
          material={materials.material_0}
          position={[0, -51850, -12000]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Light_low_material_0_0.geometry}
          material={materials.material_0}
          position={[8100, -71150, -6800]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Carry_low_material_0_0.geometry}
          material={materials.material_0}
          position={[5176.785, -14500, 25166.779]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Stairs_low_material_0_0.geometry}
          material={materials.material_0}
          position={[0, -62650, -12000]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.RailMain_low_material_0_0.geometry}
          material={materials.material_0}
          position={[8000, -25150, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.RailPoleMain_low_material_0_0.geometry}
          material={materials.material_0}
          position={[9050, -24550, 600]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.RailPoleL3_low_material_0_0.geometry}
          material={materials.material_0}
          position={[8600, -42750, -5681.313]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.RailL3_low_material_0_0.geometry}
          material={materials.material_0}
          position={[8000, -42850, -6000]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.B_low_material_0_0.geometry}
          material={materials.material_0}
          position={[0, -68650, -12000]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.RailPoleL2_low_material_0_0.geometry}
          material={materials.material_0}
          position={[8600, -50250, -5400]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.LightBase_low_material_0_0.geometry}
          material={materials.material_0}
          position={[7600, -71650, -12000]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.RailL2_low_material_0_0.geometry}
          material={materials.material_0}
          position={[8000, -51850, -6000]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Top_low_material_0_0.geometry}
          material={materials.material_0}
          position={[-10763.65, -10763.65, 30366.779]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Roof_low_material_0_0.geometry}
          material={materials.material_0}
          position={[-19000, -19000, 23166.779]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.RailPoleL1_low_material_0_0.geometry}
          material={materials.material_0}
          position={[8600, -68550, -11681.313]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.RailL1_low_material_0_0.geometry}
          material={materials.material_0}
          position={[8000, -68650, -12000]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Detail_low_material_0_0.geometry}
          material={materials.material_0}
          position={[0, -12800, 16400]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.RailL12_low_material_0_0.geometry}
          material={materials.material_0}
          position={[68650, -10200.1, -12000]}
          rotation={[0, 0, Math.PI / 2]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["Detail_low_(2)_material_0_0"].geometry}
          material={materials.material_0}
          position={[0, 12799.998, 16400]}
          rotation={[0, 0, Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailL12_low_(2)_material_0_0"].geometry}
          material={materials.material_0}
          position={[68650, 10200.102, -11999.999]}
          rotation={[0, 0, Math.PI / 2]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailPoleTop_low_(2)_material_0_0"].geometry}
          material={materials.material_0}
          position={[0, 12763.673, 27366.779]}
          rotation={[0, 0, Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailL1_low_(2)_material_0_0"].geometry}
          material={materials.material_0}
          position={[8000, 68650, -11999.994]}
          rotation={[0, 0, Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailPoleL1_low_(2)_material_0_0"].geometry}
          material={materials.material_0}
          position={[8600, 68550, -11681.307]}
          rotation={[0, 0, Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailL2_low_(2)_material_0_0"].geometry}
          material={materials.material_0}
          position={[8000, 51850, -5999.996]}
          rotation={[0, 0, Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailPoleL2_low_(2)_material_0_0"].geometry}
          material={materials.material_0}
          position={[8600, 50250, -5399.996]}
          rotation={[0, 0, Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailL3_low_(2)_material_0_0"].geometry}
          material={materials.material_0}
          position={[8000, 42850, -5999.996]}
          rotation={[0, 0, Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailPoleL3_low_(2)_material_0_0"].geometry}
          material={materials.material_0}
          position={[8600, 42750, -5681.309]}
          rotation={[0, 0, Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailPoleMain_low_(2)_material_0_0"].geometry}
          material={materials.material_0}
          position={[9050, 24550, 600.002]}
          rotation={[0, 0, Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailMain_low_(2)_material_0_0"].geometry}
          material={materials.material_0}
          position={[8000, 25150, 0.002]}
          rotation={[0, 0, Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["B_low_(2)_material_0_0"].geometry}
          material={materials.material_0}
          position={[0, 68650, -11999.994]}
          rotation={[0, 0, Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["Stairs_low_(2)_material_0_0"].geometry}
          material={materials.material_0}
          position={[0, 62650, -11999.994]}
          rotation={[0, 0, Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["LightBase_low_(2)_material_0_0"].geometry}
          material={materials.material_0}
          position={[7600, 71650, -11999.994]}
          rotation={[0, 0, Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["Light_low_(2)_material_0_0"].geometry}
          material={materials.material_0}
          position={[8100, 71150, -6799.994]}
          rotation={[0, 0, Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["Carry_low_(2)_material_0_0"].geometry}
          material={materials.material_0}
          position={[5176.785, 14499.997, 25166.781]}
          rotation={[0, 0, Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["Base_low_(2)_material_0_0"].geometry}
          material={materials.material_0}
          position={[0, 51850, -11999.995]}
          rotation={[0, 0, Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["Top_low_(2)_material_0_0"].geometry}
          material={materials.material_0}
          position={[-10763.65, 10763.647, 30366.779]}
          rotation={[0, 0, Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailTop_low_(2)_material_0_0"].geometry}
          material={materials.material_0}
          position={[0, 12999.997, 29166.779]}
          rotation={[0, 0, Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["Roof_low_(2)_material_0_0"].geometry}
          material={materials.material_0}
          position={[-19000, 18999.998, 23166.783]}
          rotation={[0, 0, Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["Pole_low_(2)_material_0_0"].geometry}
          material={materials.material_0}
          position={[11050, 13950, 0.001]}
          rotation={[0, 0, Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["Pole_low_(3)_material_0_0"].geometry}
          material={materials.material_0}
          position={[-11050, 13950, 0.001]}
          rotation={[0, 0, -Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["Roof_low_(3)_material_0_0"].geometry}
          material={materials.material_0}
          position={[19000, 18999.998, 23166.783]}
          rotation={[0, 0, -Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailTop_low_(3)_material_0_0"].geometry}
          material={materials.material_0}
          position={[0, 12999.997, 29166.779]}
          rotation={[0, 0, -Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["Top_low_(3)_material_0_0"].geometry}
          material={materials.material_0}
          position={[10763.65, 10763.647, 30366.779]}
          rotation={[0, 0, -Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["Base_low_(3)_material_0_0"].geometry}
          material={materials.material_0}
          position={[0, 51850, -11999.995]}
          rotation={[0, 0, -Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["Carry_low_(3)_material_0_0"].geometry}
          material={materials.material_0}
          position={[-5176.785, 14499.997, 25166.781]}
          rotation={[0, 0, -Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["Light_low_(3)_material_0_0"].geometry}
          material={materials.material_0}
          position={[-8100, 71150, -6799.994]}
          rotation={[0, 0, -Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["LightBase_low_(3)_material_0_0"].geometry}
          material={materials.material_0}
          position={[-7600, 71650, -11999.994]}
          rotation={[0, 0, -Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["Stairs_low_(3)_material_0_0"].geometry}
          material={materials.material_0}
          position={[0, 62650, -11999.994]}
          rotation={[0, 0, -Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["B_low_(3)_material_0_0"].geometry}
          material={materials.material_0}
          position={[0, 68650, -11999.994]}
          rotation={[0, 0, -Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailMain_low_(3)_material_0_0"].geometry}
          material={materials.material_0}
          position={[-8000, 25150, 0.002]}
          rotation={[0, 0, -Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailPoleMain_low_(3)_material_0_0"].geometry}
          material={materials.material_0}
          position={[-9050, 24550, 600.002]}
          rotation={[0, 0, -Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailPoleL3_low_(3)_material_0_0"].geometry}
          material={materials.material_0}
          position={[-8600, 42750, -5681.309]}
          rotation={[0, 0, -Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailL3_low_(3)_material_0_0"].geometry}
          material={materials.material_0}
          position={[-8000, 42850, -5999.996]}
          rotation={[0, 0, -Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailPoleL2_low_(3)_material_0_0"].geometry}
          material={materials.material_0}
          position={[-8600, 50250, -5399.996]}
          rotation={[0, 0, -Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailL2_low_(3)_material_0_0"].geometry}
          material={materials.material_0}
          position={[-8000, 51850, -5999.996]}
          rotation={[0, 0, -Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailPoleL1_low_(3)_material_0_0"].geometry}
          material={materials.material_0}
          position={[-8600, 68550, -11681.307]}
          rotation={[0, 0, -Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailL1_low_(3)_material_0_0"].geometry}
          material={materials.material_0}
          position={[-8000, 68650, -11999.994]}
          rotation={[0, 0, -Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailPoleTop_low_(3)_material_0_0"].geometry}
          material={materials.material_0}
          position={[0, 12763.673, 27366.779]}
          rotation={[0, 0, -Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailL12_low_(3)_material_0_0"].geometry}
          material={materials.material_0}
          position={[-68650, 10200.102, -11999.999]}
          rotation={[0, 0, -Math.PI / 2]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["Detail_low_(3)_material_0_0"].geometry}
          material={materials.material_0}
          position={[0, 12799.998, 16400]}
          rotation={[0, 0, -Math.PI]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["Detail_low_(4)_material_0_0"].geometry}
          material={materials.material_0}
          position={[0, -12800, 16400]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailL12_low_(4)_material_0_0"].geometry}
          material={materials.material_0}
          position={[-68650, -10200.101, -12000]}
          rotation={[0, 0, -Math.PI / 2]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailPoleTop_low_(4)_material_0_0"].geometry}
          material={materials.material_0}
          position={[0, -12763.676, 27366.777]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailL1_low_(4)_material_0_0"].geometry}
          material={materials.material_0}
          position={[-8000, -68650, -12000]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailPoleL1_low_(4)_material_0_0"].geometry}
          material={materials.material_0}
          position={[-8600, -68550, -11681.313]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailL2_low_(4)_material_0_0"].geometry}
          material={materials.material_0}
          position={[-8000, -51850, -6000]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailPoleL2_low_(4)_material_0_0"].geometry}
          material={materials.material_0}
          position={[-8600, -50250, -5400]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailL3_low_(4)_material_0_0"].geometry}
          material={materials.material_0}
          position={[-8000, -42850, -6000]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailPoleL3_low_(4)_material_0_0"].geometry}
          material={materials.material_0}
          position={[-8600, -42750, -5681.313]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailPoleMain_low_(4)_material_0_0"].geometry}
          material={materials.material_0}
          position={[-9050, -24550, 600]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailMain_low_(4)_material_0_0"].geometry}
          material={materials.material_0}
          position={[-8000, -25150, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["B_low_(4)_material_0_0"].geometry}
          material={materials.material_0}
          position={[0, -68650, -12000]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["Stairs_low_(4)_material_0_0"].geometry}
          material={materials.material_0}
          position={[0, -62650, -12000]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["LightBase_low_(4)_material_0_0"].geometry}
          material={materials.material_0}
          position={[-7600, -71650, -12000]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["Light_low_(4)_material_0_0"].geometry}
          material={materials.material_0}
          position={[-8100, -71150, -6800]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["Carry_low_(4)_material_0_0"].geometry}
          material={materials.material_0}
          position={[-5176.785, -14500, 25166.779]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["Base_low_(4)_material_0_0"].geometry}
          material={materials.material_0}
          position={[0, -51850, -12000]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["Top_low_(4)_material_0_0"].geometry}
          material={materials.material_0}
          position={[10763.65, -10763.65, 30366.777]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["RailTop_low_(4)_material_0_0"].geometry}
          material={materials.material_0}
          position={[0, -13000, 29166.777]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["Roof_low_(4)_material_0_0"].geometry}
          material={materials.material_0}
          position={[19000, -19000, 23166.781]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["Pole_low_(4)_material_0_0"].geometry}
          material={materials.material_0}
          position={[-11050, -13950, 0]}
        />
      </group>
    </a.group>
    
  );
}
