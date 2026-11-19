import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 112,
          background: 'linear-gradient(145deg, #FFF9EC 0%, #FDE68A 100%)',
        }}
      >
        <div
          style={{
            width: 376,
            height: 376,
            borderRadius: 9999,
            background: '#FBBF24',
            border: '22px solid #2B252C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 274,
              height: 274,
              borderRadius: 9999,
              background: '#FDE68A',
              border: '10px solid #D97706',
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
                gap: 54,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9999,
                  background: '#2B252C',
                }}
              />
              <div
                style={{
                  width: 34,
                  height: 34,
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
                gap: 22,
                marginTop: 20,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 22,
                  borderRadius: 9999,
                  background: '#FB7185',
                }}
              />
              <div
                style={{
                  width: 44,
                  height: 24,
                  borderBottom: '11px solid #2B252C',
                  borderRadius: '0 0 32px 32px',
                }}
              />
              <div
                style={{
                  width: 38,
                  height: 22,
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
