import { useState, useEffect, useRef } from 'react';
import { Button } from '../Button/Button';
import { css } from '../../../styled-system/css';

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SpeechRecognition =
  typeof window !== 'undefined'
    ? (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition
    : undefined;

export function VoiceInputModal({ isOpen, onClose }: VoiceInputModalProps) {
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<{ abort: () => void } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setTranscript('');
      setInterim('');
      setError(null);
      setIsListening(false);
      const rec = recognitionRef.current;
      if (rec) {
        try {
          rec.abort();
        } catch {}
        recognitionRef.current = null;
      }
      return;
    }

    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new (SpeechRecognition as any)();
    recognitionRef.current = rec;
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (event: { resultIndex: number; results: Array<{ isFinal: boolean; 0: { transcript: string } }> }) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          setTranscript((prev) => prev + text);
          setInterim('');
        } else {
          setInterim(text);
        }
      }
    };

    rec.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    rec.onerror = (event: { error: string }) => {
      if (event.error === 'not-allowed') {
        setError('Microphone access was denied.');
      } else if (event.error === 'no-speech') {
        setError('No speech detected.');
      } else {
        setError(`Speech recognition error: ${event.error}.`);
      }
      setIsListening(false);
      recognitionRef.current = null;
    };

    try {
      rec.start();
      setIsListening(true);
    } catch (e) {
      setError('Could not start the microphone.');
    }

    return () => {
      try {
        rec.abort();
      } catch {}
      recognitionRef.current = null;
      setTranscript('');
      setInterim('');
      setError(null);
      setIsListening(false);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  let body: React.ReactNode;
  if (error) {
    body = (
      <p className={css({ color: 'red.600', margin: 0 })}>{error}</p>
    );
  } else if (transcript || interim) {
    body = (
      <p className={css({ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' })}>
        {transcript}
        {interim && (
          <span className={css({ color: 'gray.500', fontStyle: 'italic' })}>
            {interim}
          </span>
        )}
      </p>
    );
  } else if (isListening) {
    body = (
      <p className={css({ margin: 0, color: 'gray.600' })}>Listening…</p>
    );
  } else {
    body = (
      <p className={css({ margin: 0, color: 'gray.600' })}>No speech detected.</p>
    );
  }

  return (
    <div
      className={css({
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '1rem',
      })}
      onClick={onClose}
    >
      <div
        className={css({
          position: 'relative',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '2rem',
          maxWidth: 'min(420px, 100%)',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        })}
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          color="rose"
          size="small"
          onClick={onClose}
          aria-label="Close"
          className={css({
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            minWidth: '2rem',
            padding: '0.25rem',
          })}
        >
          ×
        </Button>
        <h2
          className={css({
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
          })}
        >
          Voice input
        </h2>
        <div className={css({ minHeight: '4rem' })}>{body}</div>
      </div>
    </div>
  );
}
