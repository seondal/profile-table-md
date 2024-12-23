import "./App.css";

import { useState } from "react";
import { Profile } from "./types/interface";
import axios from "axios";
import { GetUserResponse } from "./types/response";
import ProfileCard from "./components/ProfileCard";
import { styled } from "styled-components";
import { GITHUB_TOKEN } from "./constant/env";
import { gaEvent } from "./utils/ga4";

function App() {
  const [value, setValue] = useState("");
  const [profileList, setProfileList] = useState<Profile[]>([]);
  const [profile, setProfile] = useState<Profile>();
  const [result, setResult] = useState<string>();

  async function getUser() {
    try {
      const response = await axios.get(
        `https://api.github.com/users/${value}`,
        {
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
          },
        }
      );
      if (response.status === 200) {
        gaEvent({
          event: "search_success",
          params: { search_success_id: value },
        });
        const data: GetUserResponse = response.data;
        setProfile({
          id: data.login,
          image: data.avatar_url,
          url: data.html_url,
          name: data.name,
        });
      }
    } catch (e: any) {
      gaEvent({ event: "serach_fail", params: { search_fail_id: value } });
      const statusCode = e.response.status;
      if (statusCode === 404) {
        alert("올바른 깃허브 아이디를 입력해주세요");
        return;
      }
      alert(`개발자에게 문의해주세요\nErrorCode: ${statusCode.status}`);
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    gaEvent({ event: "search_user", params: { github_id: value } });
    getUser();
    setValue("");
  }

  function addProfile() {
    if (profile) {
      gaEvent({ event: "add_profile", params: { added_id: profile.id } });
    }
    setProfileList((prev) => [...prev, profile as Profile]);
  }

  function createTable() {
    const col = profileList.length;

    let markdown = `## Team`;

    // markdown += `\n|`;
    // for (let i = 0; i < col; i++) {
    //   markdown += `|`;
    // }

    markdown += `\n|`;
    for (const item of profileList) {
      markdown += `<img src="${item.image}" width="150" height="150"/>|`;
    }

    markdown += `\n|`;
    for (let i = 0; i < col; i++) {
      markdown += `:-:|`;
    }

    markdown += `\n|`;
    for (const item of profileList) {
      if (item.name) {
        markdown += `${item.name}<br/>`;
      }
      markdown += `[@${item.id}](${item.url})|`;
    }

    markdown += `\n\n<sub>[Table made by TIT](https://team-info-table.seondal.kr/)</sub>`;

    gaEvent({ event: "create_table", params: { created_table: markdown } });
    setResult(markdown);
  }

  function copyResult() {
    gaEvent({ event: "copy_table", params: { copied_table: result } });
    navigator.clipboard.writeText(result as string).then(() => {
      alert("마크다운 코드가 복사되었습니다! 리드미에 붙여넣어보세요");
    });
  }

  return (
    <div className="App">
      <RowWrapper>
        <div>
          <h1>Github Markdown Table Generator</h1>
          <h5>
            팀원의 깃허브 아이디를 입력하면 깃허브 프로필로 이루어진 마크다운
            표를 자동으로 생성합니다
          </h5>
          <div className="input-box">
            <form onSubmit={onSubmit}>
              <input value={value} onChange={(e) => setValue(e.target.value)} />
              <button type="submit">검색</button>
              <div>
                <b>사용법</b>
                <br />
                1. 깃허브 아이디로 유저를 검색한다.
                <br />
                2. 팀원을 추가한다
                <br />
                3. 표 생성하기 버튼을 누른다
                <br />
                4. 나온 마크다운 코드를 복사해서 깃허브 리드미에 붙여넣는다
                <br />
                <br />
                <a href="https://litt.ly/seondal">이 사이트 만든 사람</a>
              </div>
            </form>
            {profile && (
              <div>
                <ProfileCard data={profile} size={"12rem"} />
                <button onClick={addProfile}>추가하기</button>
              </div>
            )}
          </div>
        </div>
      </RowWrapper>

      {profileList.length !== 0 && (
        <div>
          <h4>추가된 팀원 {profileList.length}명</h4>
          <List>
            {profileList.map((item, idx) => (
              <ProfileCard data={item} size={"8rem"} key={idx} />
            ))}
          </List>
          <button onClick={createTable}>표 생성하기</button>
          {result && <button onClick={copyResult}>마크다운 복사하기</button>}
        </div>
      )}
      {result && <Result>{result}</Result>}
    </div>
  );
}
export default App;

const RowWrapper = styled.section`
  width: 100%;
  justify-content: space-between;

  .input-box {
    display: flex;
    gap: 16px;
  }
`;

const List = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap-reverse;
`;

const Result = styled.div`
  padding: 1rem;
  white-space: pre-wrap;
`;
