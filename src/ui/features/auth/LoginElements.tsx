import { styled } from 'styled-components';

export const LoginWrapperEl = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 640px;
  margin: auto;
  padding: 1rem;
  align-items: center;
  background-color: white;
  margin-top: 10rem;
`;

export const LoginFormEl = styled.form`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;
  
export const LoginInputEl = styled.input`
  background-color: #EEEEEE;
  border: none;
  height: 3rem;
  width: 90%;
  margin: auto;
  margin-top: 1rem;
  font-size: 16px;
  display: ${({ hidden }) => hidden ? 'none' : 'inherit'}
  padding-right: 1rem;
  padding-left: 1rem;
`;

export const LoginFormSeparator = styled.hr`
  width: 90%;
`

export const LoginButtonEl = styled.button`
  height: 2rem;
  width: 10rem;
  margin: 1rem;
  background-color: darkgrey;
  border: none;
  font-size: 16px;
`;

export const LoginLink = styled.a`
  margin-left: auto;
  cursor: pointer;
`;

export const LoginHeading = styled.h3`
  width: 100%;
  text-align: center;
`;

export const ErrorText = styled.p`
  color: red;
  background-color: #FFEEEE;
  padding: 1rem 2rem;
`;
