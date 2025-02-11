import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import {
  useLivenessPlugin,
  type LivenessResponse,
} from '@bilguun0203/react-native-liveness-detector';
import {
  Camera,
  runAsync,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { useRunOnJS } from 'react-native-worklets-core';

export default function App() {
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();
  const [permReqRes, setPermReqRes] = useState<boolean>(hasPermission);
  const [livenessResponse, setLivenessResponse] =
    useState<LivenessResponse | null>(null);
  const format = useCameraFormat(device, [
    { videoResolution: { width: 1280, height: 720 } },
    { fps: 10 },
  ]);

  const plugin = useLivenessPlugin();

  useEffect(() => {
    if (!hasPermission) {
      const perm = async () => {
        setPermReqRes(await requestPermission());
      };
      perm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const livenessOnResult = useRunOnJS((result: LivenessResponse) => {
    if (result.face != null) {
      setLivenessResponse(result);
    } else {
      setLivenessResponse(null);
    }
  }, []);

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';
      runAsync(frame, () => {
        'worklet';
        const result = plugin.liveness(frame);
        livenessOnResult(result);
      });
    },
    [livenessOnResult]
  );

  const faceLeft = livenessResponse?.face
    ? (livenessResponse.face.left / 720) * windowWidth
    : 0;
  const faceRight = livenessResponse?.face
    ? (livenessResponse.face.right / 720) * windowWidth
    : 0;
  const faceTop = livenessResponse?.face
    ? (livenessResponse.face.top / 1280) * windowHeight
    : 0;
  const faceBottom = livenessResponse?.face
    ? (livenessResponse.face.bottom / 1280) * windowHeight
    : 0;
  const faceWidth = faceRight - faceLeft;
  const faceHeight = faceBottom - faceTop;

  if (!hasPermission && !permReqRes)
    return (
      <View style={styles.container}>
        <Text>No camera permission</Text>
      </View>
    );
  if (device == null)
    return (
      <View style={styles.container}>
        <Text>No camera</Text>
      </View>
    );
  return (
    <>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        format={format}
        pixelFormat="yuv"
        frameProcessor={frameProcessor}
        enableFpsGraph={true}
      />
      {livenessResponse != null && (
        <>
          <Text
            style={{
              position: 'absolute',
              bottom: 0,
              backgroundColor: '#fff',
              paddingHorizontal: 16,
            }}
          >
            Left: {livenessResponse.face?.left + '\n'}
            Top: {livenessResponse.face?.top + '\n'}
            Right: {livenessResponse.face?.right + '\n'}
            Bottom: {livenessResponse.face?.bottom + '\n'}
            score: {livenessResponse.score + '\n'}
            yaw: {livenessResponse.rotation?.yaw + '\n'}
            roll: {livenessResponse.rotation?.roll + '\n'}
            pitch: {livenessResponse.rotation?.pitch + '\n'}
            mouthOpen: {livenessResponse.features.isMouthOpen + '\n'}
            leftEyeOpen: {livenessResponse.features.isLeftEyeOpen + '\n'}
            rightEyeOpen: {livenessResponse.features.isRightEyeOpen + '\n'}
            horizontalRotation:{' '}
            {livenessResponse.features.horizontalRotation + '\n'}
            verticalRotation:{' '}
            {livenessResponse.features.verticalRotation + '\n'}
            mouthArea: {livenessResponse.landmarks?.mouthArea + '\n'}
            leftEyeArea: {livenessResponse.landmarks?.leftEyeArea + '\n'}
            rightEyeArea: {livenessResponse.landmarks?.rightEyeArea + '\n'}
          </Text>
          {livenessResponse.face && livenessResponse.landmarks && (
            <>
              <View
                style={{
                  position: 'absolute',
                  left:
                    faceLeft +
                    (livenessResponse.landmarks.noseTip[0] ?? 0) * faceWidth -
                    2,
                  top:
                    faceTop +
                    (livenessResponse.landmarks.noseTip[1] ?? 0) * faceHeight -
                    2,
                  width: 5,
                  height: 5,
                  borderWidth: 1,
                  borderColor: 'red',
                  borderRadius: 999,
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  left:
                    faceLeft +
                    (livenessResponse.landmarks.lipsTop[0] ?? 0) * faceWidth -
                    2,
                  top:
                    faceTop +
                    (livenessResponse.landmarks.lipsTop[1] ?? 0) * faceHeight -
                    2,
                  width: 5,
                  height: 5,
                  borderWidth: 1,
                  borderColor: 'red',
                  borderRadius: 999,
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  left:
                    faceLeft +
                    (livenessResponse.landmarks.lipsBottom[0] ?? 0) *
                    faceWidth -
                    2,
                  top:
                    faceTop +
                    (livenessResponse.landmarks.lipsBottom[1] ?? 0) *
                    faceHeight -
                    2,
                  width: 5,
                  height: 5,
                  borderWidth: 1,
                  borderColor: 'red',
                  borderRadius: 999,
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  left:
                    faceLeft +
                    (livenessResponse.landmarks.leftEyeTop[0] ?? 0) *
                    faceWidth -
                    2,
                  top:
                    faceTop +
                    (livenessResponse.landmarks.leftEyeTop[1] ?? 0) *
                    faceHeight -
                    2,
                  width: 5,
                  height: 5,
                  borderWidth: 1,
                  borderColor: 'red',
                  borderRadius: 999,
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  left:
                    faceLeft +
                    (livenessResponse.landmarks.leftEyeBottom[0] ?? 0) *
                    faceWidth -
                    2,
                  top:
                    faceTop +
                    (livenessResponse.landmarks.leftEyeBottom[1] ?? 0) *
                    faceHeight -
                    2,
                  width: 5,
                  height: 5,
                  borderWidth: 1,
                  borderColor: 'red',
                  borderRadius: 999,
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  left:
                    faceLeft +
                    (livenessResponse.landmarks.rightEyeTop[0] ?? 0) *
                    faceWidth -
                    2,
                  top:
                    faceTop +
                    (livenessResponse.landmarks.rightEyeTop[1] ?? 0) *
                    faceHeight -
                    2,
                  width: 5,
                  height: 5,
                  borderWidth: 1,
                  borderColor: 'red',
                  borderRadius: 999,
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  left:
                    faceLeft +
                    (livenessResponse.landmarks.rightEyeBottom[0] ?? 0) *
                    faceWidth -
                    2,
                  top:
                    faceTop +
                    (livenessResponse.landmarks.rightEyeBottom[1] ?? 0) *
                    faceHeight -
                    2,
                  width: 5,
                  height: 5,
                  borderWidth: 1,
                  borderColor: 'red',
                  borderRadius: 999,
                }}
              />
            </>
          )}
          {livenessResponse.face &&
            livenessResponse.landmarks &&
            livenessResponse.rotation && (
              <View
                style={{
                  position: 'absolute',
                  left:
                    faceLeft +
                    (livenessResponse.landmarks.noseTip[0] ?? 0) * faceWidth -
                    25,
                  top:
                    faceTop +
                    (livenessResponse.landmarks.noseTip[1] ?? 0) * faceWidth,
                  width: 50,
                  height: 6,
                  backgroundColor: 'red',
                  transform: [
                    { rotateX: `${livenessResponse.rotation.pitch}deg` },
                    { rotateY: `${livenessResponse.rotation.roll}deg` },
                    { rotateZ: `${90 - livenessResponse.rotation.yaw}deg` },
                  ],
                }}
              />
            )}
          {livenessResponse.face &&
            livenessResponse.landmarks &&
            livenessResponse.rotation && (
              <View
                style={{
                  position: 'absolute',
                  left:
                    faceLeft +
                    (livenessResponse.landmarks.noseTip[0] ?? 0) * faceWidth -
                    25,
                  top:
                    faceTop +
                    (livenessResponse.landmarks.noseTip[1] ?? 0) * faceWidth,
                  width: 50,
                  height: 6,
                  backgroundColor: 'green',
                  transform: [
                    { rotateX: `${90 - livenessResponse.rotation.pitch}deg` },
                    {
                      rotateY: `${(livenessResponse.rotation.yaw + 90) * 3}deg`,
                    },
                    { rotateZ: `${livenessResponse.rotation.roll - 90}deg` },
                  ],
                }}
              />
            )}
          {livenessResponse.face &&
            livenessResponse.landmarks &&
            livenessResponse.rotation && (
              <View
                style={{
                  position: 'absolute',
                  left:
                    faceLeft +
                    (livenessResponse.landmarks.noseTip[0] ?? 0) * faceWidth -
                    3,
                  top:
                    faceTop +
                    (livenessResponse.landmarks.noseTip[1] ?? 0) * faceWidth -
                    22,
                  width: 6,
                  height: 50,
                  backgroundColor: 'blue',
                  transform: [
                    { rotateX: `${livenessResponse.rotation.pitch}deg` },
                    { rotateY: `${livenessResponse.rotation.roll}deg` },
                    { rotateZ: `${90 - livenessResponse.rotation.yaw}deg` },
                  ],
                }}
              />
            )}

          <View
            style={{
              position: 'absolute',
              left: faceLeft,
              top: faceTop,
              width: faceWidth,
              height: faceHeight,
              borderWidth: 1,
              borderColor: 'yellow',
              borderRadius: faceHeight,
            }}
          />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
