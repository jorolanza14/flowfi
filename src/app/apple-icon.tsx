import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #FFF9EC 0%, #FDE68A 100%)',
        }}
      >
        <div
          style={{
            width: 134,
            height: 134,
            borderRadius: 9999,
            background: '#FBBF24',
            border: '8px solid #2B252C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 98,
              height: 98,
              borderRadius: 9999,
              background: '#FDE68A',
              border: '4px solid #D97706',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 20,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 9999,
                  background: '#2B252C',
                }}
              />
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 9999,
                  background: '#2B252C',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 7,
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 8,
                  borderRadius: 9999,
                  background: '#FB7185',
                }}
              />
              <div
                style={{
                  width: 16,
                  height: 9,
                  borderBottom: '4px solid #2B252C',
                  borderRadius: '0 0 12px 12px',
                }}
              />
              <div
                style={{
                  width: 14,
                  height: 8,
                  borderRadius: 9999,
                  background: '#FB7185',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
