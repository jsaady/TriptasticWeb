import { useEffect, useRef, useState } from 'react';
import { useAsync, useAsyncHttp } from '../../utils/useAsync.js';

export interface AudioRecorderProps {
  onNewText?: (newText: string) => any;
}

function AudioRecorder({ onNewText }: AudioRecorderProps) {
    const [recording, setRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder>(null as any as MediaRecorder);
    const recordedChunks = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) {
                    recordedChunks.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                // Handle the recorded chunks, for example, by sending them to an API
                handleAudioData(recordedChunks.current);
                recordedChunks.current = [];
            };

            mediaRecorder.start();
            setRecording(true);
        } catch (error) {
            console.error("Error accessing the microphone:", error);
        }
    };

    const stopRecording = () => {
      const mediaRecorder = mediaRecorderRef.current;
        if (mediaRecorder) {
            mediaRecorder.stop();
            setRecording(false);
        }
    };

    const [handleAudioData, { result }] = useAsyncHttp(async ({ post }, chunks: BlobPart[]) => {
      const audioBlob = new Blob(chunks, { type: 'audio/wav' });

      const formData = new FormData();
      formData.append('audio', audioBlob);

      return post<{ text: string }>('/api/notes/transcribe', formData);
    }, []);

    useEffect(() => {
      if (result?.text) {
        onNewText?.(result.text);
      }
    }, [result]);

    return (
        <div>
            {!recording ? (
                <button onClick={startRecording}>Start Recording</button>
            ) : (
                <button onClick={stopRecording}>Stop Recording</button>
            )}
        </div>
    );
}

export default AudioRecorder;
