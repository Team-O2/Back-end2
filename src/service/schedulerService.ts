import schedule from "node-schedule";
// models
import Admin from "../models/Admin";
import User from "../models/User";
import Badge from "../models/Badge";
// libraries
import { stringToDate, period, dateToString } from "../library/date";

export const challengeOpen = schedule.scheduleJob("0 0 0 * * *", async () => {
  console.log("Changing Generation...");
  const newDate = dateToString(new Date());
  const today = stringToDate(newDate.substr(0, 10));
  const newChallenge = await Admin.findOne({
    challengeStartDT: today,
  });
  // 챌린지 시작하는 경우
  if (newChallenge) {
    const allUsers = await User.find();

    allUsers.map(async (user) => {
      let userBadge = await Badge.findOne({ user: user._id });
      // 1. 이전 챌린지 참가자들에 대해
      if (user.isChallenge === true) {
        // 일주일에 2개 이상 작성 기준인 경우
        if (user.conditionCNT > 2) {
          // 유저 챌린지 배지 개수 파악
          if (userBadge.challengeBadge < 3) {
            // 유저의 챌린지 퍼센트 계산
            let term = period(
              newChallenge.challengeStartDT,
              newChallenge.challengeEndDT
            );
            let totalNum = user.conditionCNT * Math.floor(term / 7);
            let percent = Math.ceil((user.writingCNT / totalNum) * 100);

            // 80% 이상이면 배지 부여 ->ok
            if (percent >= 80) {
              await userBadge.update({
                $inc: {
                  challengeBadge: 1,
                },
              });
              await userBadge.save();
            }
          }
        }
        // 작성 회고 글 개수 0으로 초기화 ->ok
        // 챌린지 동안 일주일 작성 글 개수 기준 0으로 초기화 ->ok
        // 챌린지 여부 초기화 ->ok
        await user.update({
          isChallenge: false,
          writingCNT: 0,
          conditionCNT: 0,
        });
      }

      // 2. 챌린지를 신청한 유저들에 대해
      if (user.isRegist === true) {
        // isChallenge=true, isRegister=false로 변경 ->ok
        // 신청할 때 저장한 챌린지 작성 글 개수 기준으로 변경 ->ok
        // 신청할 때 챌린지 작성 글 개수 기준 0으로 초기화 ->ok
        // 유저의 기수를 새로 열리는 챌린지에 대한 기수로 변경 ->ok
        const newConditionCNT = user.challengeCNT;
        await user.update({
          isChallenge: true,
          isRegist: false,
          challengeCNT: 0,
          conditionCNT: newConditionCNT,
          generation: newChallenge.generation,
        });
      }

      // 3. 가입한지 3달이 지난 유저에게 배지 부여 ->ok
      let term = period(user.createDT, new Date());
      if (term >= 90 && !userBadge.loginBadge) {
        await userBadge.update({ loginBadge: true });
      }
    });
  }
});
