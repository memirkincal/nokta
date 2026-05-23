import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Asset } from 'expo-asset';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Canvas, useFrame, useLoader } from '@react-three/fiber/native';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

const AVATAR_MODEL = require('../../assets/avatar.glb');

function AvatarMesh({ level, persona, modelUri }) {
  const group = useRef(null);
  const gltf = useLoader(GLTFLoader, modelUri);

  const mouth = useMemo(() => {
    let found = null;
    gltf.scene.traverse((object) => {
      const name = String(object.name || '').toLowerCase();
      if (!found && (name.includes('mouth') || name.includes('jaw') || name.includes('lip'))) {
        found = object;
      }
    });
    return found;
  }, [gltf]);

  useEffect(() => {
    gltf.scene.traverse((object) => {
      if (object.isMesh && object.material) {
        const material = object.material;
        if (material && material.color) {
          material.color = new THREE.Color(persona.headColor);
          material.roughness = 0.55;
          material.metalness = 0.05;
        }
      }
    });
  }, [gltf, persona.headColor]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const root = group.current;
    if (!root) {
      return;
    }

    root.rotation.y = Math.sin(t * 0.45) * 0.2;
    root.rotation.x = Math.sin(t * 0.3) * 0.06 - 0.02;

    if (mouth) {
      const openness = 0.55 + level * 1.8;
      mouth.scale.y = openness;
      mouth.scale.x = 1 + level * 0.15;
    }
  });

  return (
    <primitive
      ref={group}
      object={gltf.scene}
      scale={persona.scale}
      position={[0, -1.15, 0]}
      dispose={null}
    />
  );
}

function FallbackAvatar({ level, persona }) {
  return (
    <View style={[styles.fallback, { backgroundColor: persona.backdrop }]}>
      <View style={[styles.face, { borderColor: persona.accent }]}>
        <View
          style={[
            styles.eye,
            { backgroundColor: persona.accent, transform: [{ scale: 0.9 + level * 0.2 }] },
          ]}
        />
        <View
          style={[
            styles.eye,
            { backgroundColor: persona.accent, transform: [{ scale: 0.9 + level * 0.2 }] },
          ]}
        />
        <View
          style={[
            styles.mouth,
            {
              borderBottomColor: persona.accent,
              transform: [{ scaleX: 0.9 + level * 0.55 }, { scaleY: 0.8 + level * 0.9 }],
            },
          ]}
        />
      </View>
    </View>
  );
}

export default function AvatarStage({ level, persona, statusText }) {
  const [modelUri, setModelUri] = useState('');

  useEffect(() => {
    let mounted = true;
    Asset.fromModule(AVATAR_MODEL)
      .downloadAsync()
      .then((asset) => {
        if (mounted) {
          setModelUri(asset.localUri || asset.uri);
        }
      })
      .catch(() => {
        if (mounted) {
          setModelUri('');
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Avatar stage</Text>
          <Text style={styles.subtitle}>{statusText}</Text>
        </View>
        <View style={[styles.tag, { backgroundColor: persona.badge }]}>
          <Text style={[styles.tagText, { color: persona.accent }]}>{persona.label}</Text>
        </View>
      </View>

      <View style={styles.canvasBox}>
        <Canvas camera={{ position: [0, 0.1, 4.3], fov: 36 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[3, 4, 5]} intensity={1.4} />
          <pointLight position={[-2, -1, 3]} intensity={0.5} color={persona.accent} />
          <Suspense fallback={null}>
            {modelUri ? (
              <AvatarMesh level={level} persona={persona} modelUri={modelUri} />
            ) : null}
          </Suspense>
        </Canvas>

        <View pointerEvents="none" style={styles.overlay}>
          <View style={[styles.pulse, { opacity: 0.35 + level * 0.65 }]} />
          <Text style={styles.overlayText}>
            {level > 0.18 ? 'Talking' : 'Quiet'} · mouth drive {Math.round(level * 100)}%
          </Text>
        </View>

        <View style={styles.fallbackLayer} pointerEvents="none">
          <FallbackAvatar level={level} persona={persona} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: 'rgba(8, 15, 33, 0.92)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  title: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  canvasBox: {
    height: 280,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#050a14',
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(8, 15, 33, 0.78)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pulse: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: '#22d3ee',
  },
  overlayText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '700',
  },
  fallbackLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.13,
  },
  fallback: {
    width: 170,
    height: 170,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  face: {
    width: 150,
    height: 150,
    borderRadius: 48,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
  },
  eye: {
    width: 12,
    height: 12,
    borderRadius: 12,
  },
  mouth: {
    width: 48,
    height: 20,
    borderBottomWidth: 4,
    borderRadius: 20,
    marginTop: 6,
  },
});
