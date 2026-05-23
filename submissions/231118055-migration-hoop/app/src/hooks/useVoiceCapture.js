import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';

const RECORDING_OPTIONS = {
  isMeteringEnabled: true,
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};

function useSpeechRecognitionModule() {
  return useMemo(() => {
    if (Platform.OS === 'web') {
      return null;
    }

    try {
      return require('expo-speech-recognition');
    } catch (error) {
      return null;
    }
  }, []);
}

function normalizeMetering(metering) {
  if (typeof metering !== 'number' || Number.isNaN(metering)) {
    return 0;
  }

  const clamped = Math.max(-160, Math.min(0, metering));
  return Math.min(1, Math.max(0, (clamped + 160) / 160));
}

export function useVoiceCapture() {
  const speechModule = useSpeechRecognitionModule();
  const recordingRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [meter, setMeter] = useState(0);
  const [audioUri, setAudioUri] = useState('');
  const [error, setError] = useState('');

  const supported = Boolean(speechModule?.ExpoSpeechRecognitionModule) || Platform.OS !== 'web';

  if (speechModule?.useSpeechRecognitionEvent) {
    const { useSpeechRecognitionEvent } = speechModule;

    useSpeechRecognitionEvent('result', (event) => {
      const text = event?.results?.[0]?.transcript ?? '';
      if (text) {
        setTranscript(text);
      }
    });

    useSpeechRecognitionEvent('end', () => {
      setListening(false);
    });

    useSpeechRecognitionEvent('error', (event) => {
      setListening(false);
      setError(event?.error ?? 'Speech recognition error');
    });
  }

  const stopRecording = useCallback(async () => {
    const recording = recordingRef.current;
    recordingRef.current = null;

    if (!recording) {
      return;
    }

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (uri) {
        setAudioUri(uri);
      }
    } catch (stopError) {
      // ignore stop races
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      if (speechModule?.ExpoSpeechRecognitionModule) {
        speechModule.ExpoSpeechRecognitionModule.stop();
      }
    } catch (speechError) {
      // ignore
    }

    await stopRecording();
    setListening(false);
  }, [speechModule, stopRecording]);

  const start = useCallback(async () => {
    if (!supported) {
      setError('Speech recognition unsupported on this platform.');
      return;
    }

    setError('');
    setTranscript('');
    setMeter(0);
    setAudioUri('');
    setListening(true);

    try {
      const micPermission = await Audio.requestPermissionsAsync();
      if (!micPermission.granted) {
        setListening(false);
        setError('Microphone permission denied.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      recording.setOnRecordingStatusUpdate((status) => {
        if (status?.isRecording) {
          setMeter(normalizeMetering(status.metering));
        }
      });

      await recording.prepareToRecordAsync(RECORDING_OPTIONS);
      await recording.startAsync();
      recordingRef.current = recording;

      if (speechModule?.ExpoSpeechRecognitionModule) {
        const perm = await speechModule.ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!perm.granted) {
          setListening(false);
          setError('Speech recognition permission denied.');
          await stopRecording();
          return;
        }

        speechModule.ExpoSpeechRecognitionModule.start({ lang: 'tr-TR', interimResults: true });
      }
    } catch (captureError) {
      setListening(false);
      setError(captureError?.message ?? 'Voice capture failed.');
      await stopRecording();
    }
  }, [speechModule, stopRecording, supported]);

  useEffect(() => {
    return () => {
      stop().catch(() => {});
    };
  }, [stop]);

  return {
    listening,
    transcript,
    meter,
    audioUri,
    error,
    supported,
    start,
    stop,
  };
}
