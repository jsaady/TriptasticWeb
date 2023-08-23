import { styled } from 'styled-components';

export const Wrapper = styled.div<{ $showGradient: boolean; }> `
  height: 100%;
  width: 100%;
  ${({ $showGradient }) => $showGradient && `background: linear-gradient(90deg, #880000, #000065);`}
  top: 0;
  position: absolute;
  font-family: "Arial";
`;
