import { expect } from "chai";
import { ethers } from "hardhat";

describe("种草社区合约测试", function () {
  let contract: any;
  let owner: any;
  let advertiser: any;
  let promoter1: any;
  let promoter2: any;
  let buyer: any;

  const TASK_PRICE = ethers.parseEther("1.0");
  const COMMISSION_RATE = 10;
  const BONUS_POOL = ethers.parseEther("10.0");

  before(async function () {
    [owner, advertiser, promoter1, promoter2, buyer] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("ZhongCaoCommunity");
    contract = await Contract.deploy();
    await contract.waitForDeployment();
  });

  async function getBalance(address: string): Promise<bigint> {
    return await ethers.provider.getBalance(address);
  }

  function formatEther(value: bigint): string {
    return ethers.formatEther(value) + " ETH";
  }

  function printSeparator(title: string) {
    console.log("\n" + "=".repeat(60));
    console.log(title);
    console.log("=".repeat(60));
  }

  it("完整流程测试", async function () {
    this.timeout(300000);

    printSeparator("步骤 1: 广告主发布任务");

    const advertiserInitialBalance = await getBalance(await advertiser.getAddress());
    console.log("广告主初始余额:", formatEther(advertiserInitialBalance));

    const taskTitle = "优质护肤产品推广";
    const taskDescription = "这是一款高品质的护肤产品，适合所有肤质";
    const coverImageHash = "QmXxx...";

    const createTaskTx = await contract.connect(advertiser).createTask(
      taskTitle,
      taskDescription,
      TASK_PRICE,
      COMMISSION_RATE,
      BONUS_POOL,
      coverImageHash,
      { value: BONUS_POOL }
    );

    const receipt = await createTaskTx.wait();
    const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
    const advertiserBalanceAfterCreate = await getBalance(await advertiser.getAddress());

    console.log("任务标题:", taskTitle);
    console.log("任务描述:", taskDescription);
    console.log("商品价格:", formatEther(TASK_PRICE));
    console.log("分佣比例:", COMMISSION_RATE + "%");
    console.log("奖金池:", formatEther(BONUS_POOL));
    console.log("Gas 费用:", formatEther(gasUsed));
    console.log("广告主发布任务后余额:", formatEther(advertiserBalanceAfterCreate));
    console.log("广告主支出（不含Gas）:", formatEther(advertiserInitialBalance - advertiserBalanceAfterCreate - gasUsed));

    const taskId = 1;
    const task = await contract.getTask(taskId);
    console.log("\n任务详情:");
    console.log("- 任务ID:", task.id.toString());
    console.log("- 广告主:", task.advertiser);
    console.log("- 是否激活:", task.isActive);
    console.log("- 创建时间:", new Date(Number(task.createdAt) * 1000).toLocaleString());

    printSeparator("步骤 2: 种草人1领取任务");

    const promoter1InitialBalance = await getBalance(await promoter1.getAddress());
    console.log("种草人1初始余额:", formatEther(promoter1InitialBalance));

    const acceptTaskTx1 = await contract.connect(promoter1).acceptTask(taskId);
    const receipt1 = await acceptTaskTx1.wait();
    const gasUsed1 = receipt1!.gasUsed * receipt1!.gasPrice;
    const promoter1BalanceAfterAccept = await getBalance(await promoter1.getAddress());

    console.log("Gas 费用:", formatEther(gasUsed1));
    console.log("种草人1领取任务后余额:", formatEther(promoter1BalanceAfterAccept));
    console.log("种草人1支出（不含Gas）:", formatEther(promoter1InitialBalance - promoter1BalanceAfterAccept - gasUsed1));

    const referral1 = await contract.getReferral(1);
    console.log("\n推荐详情:");
    console.log("- 推荐ID:", referral1.id.toString());
    console.log("- 推荐码:", referral1.refCode);
    console.log("- 种草人:", referral1.promoter);

    printSeparator("步骤 3: 种草人2领取任务");

    const promoter2InitialBalance = await getBalance(await promoter2.getAddress());
    console.log("种草人2初始余额:", formatEther(promoter2InitialBalance));

    const acceptTaskTx2 = await contract.connect(promoter2).acceptTask(taskId);
    const receipt2 = await acceptTaskTx2.wait();
    const gasUsed2 = receipt2!.gasUsed * receipt2!.gasPrice;
    const promoter2BalanceAfterAccept = await getBalance(await promoter2.getAddress());

    console.log("Gas 费用:", formatEther(gasUsed2));
    console.log("种草人2领取任务后余额:", formatEther(promoter2BalanceAfterAccept));
    console.log("种草人2支出（不含Gas）:", formatEther(promoter2InitialBalance - promoter2BalanceAfterAccept - gasUsed2));

    const referral2 = await contract.getReferral(2);
    console.log("\n推荐详情:");
    console.log("- 推荐ID:", referral2.id.toString());
    console.log("- 推荐码:", referral2.refCode);
    console.log("- 种草人:", referral2.promoter);

    printSeparator("步骤 4: 拔草人通过种草人1的推荐码购买商品");

    const buyerInitialBalance = await getBalance(await buyer.getAddress());
    const advertiserBalanceBeforePurchase1 = await getBalance(await advertiser.getAddress());
    const promoter1BalanceBeforePurchase1 = await getBalance(await promoter1.getAddress());

    console.log("拔草人初始余额:", formatEther(buyerInitialBalance));
    console.log("广告主购买前余额:", formatEther(advertiserBalanceBeforePurchase1));
    console.log("种草人1购买前余额:", formatEther(promoter1BalanceBeforePurchase1));

    const purchaseTx1 = await contract.connect(buyer).purchase(referral1.refCode, {
      value: TASK_PRICE,
    });

    const receipt3 = await purchaseTx1.wait();
    const gasUsed3 = receipt3!.gasUsed * receipt3!.gasPrice;

    const buyerBalanceAfterPurchase1 = await getBalance(await buyer.getAddress());
    const advertiserBalanceAfterPurchase1 = await getBalance(await advertiser.getAddress());
    const promoter1BalanceAfterPurchase1 = await getBalance(await promoter1.getAddress());

    const purchase1 = await contract.getPurchase(1);
    const commissionAmount1 = purchase1.commissionAmount;

    console.log("\n购买详情:");
    console.log("- 购买ID:", purchase1.id.toString());
    console.log("- 商品价格:", formatEther(purchase1.productPrice));
    console.log("- 分佣金额:", formatEther(commissionAmount1));
    console.log("- 推荐码:", referral1.refCode);

    console.log("\n余额变化（不含Gas）:");
    console.log("拔草人支出:", formatEther(buyerInitialBalance - buyerBalanceAfterPurchase1 - gasUsed3));
    console.log("广告主收入:", formatEther(advertiserBalanceAfterPurchase1 - advertiserBalanceBeforePurchase1));
    console.log("种草人1收入:", formatEther(promoter1BalanceAfterPurchase1 - promoter1BalanceBeforePurchase1));
    console.log("预期广告主收入:", formatEther(TASK_PRICE));
    console.log("预期种草人1收入:", formatEther(commissionAmount1));

    printSeparator("步骤 5: 拔草人通过种草人2的推荐码购买商品");

    const advertiserBalanceBeforePurchase2 = await getBalance(await advertiser.getAddress());
    const promoter2BalanceBeforePurchase2 = await getBalance(await promoter2.getAddress());

    console.log("广告主购买前余额:", formatEther(advertiserBalanceBeforePurchase2));
    console.log("种草人2购买前余额:", formatEther(promoter2BalanceBeforePurchase2));

    const purchaseTx2 = await contract.connect(buyer).purchase(referral2.refCode, {
      value: TASK_PRICE,
    });

    const receipt4 = await purchaseTx2.wait();
    const gasUsed4 = receipt4!.gasUsed * receipt4!.gasPrice;

    const buyerBalanceAfterPurchase2 = await getBalance(await buyer.getAddress());
    const advertiserBalanceAfterPurchase2 = await getBalance(await advertiser.getAddress());
    const promoter2BalanceAfterPurchase2 = await getBalance(await promoter2.getAddress());

    const purchase2 = await contract.getPurchase(2);
    const commissionAmount2 = purchase2.commissionAmount;

    console.log("\n购买详情:");
    console.log("- 购买ID:", purchase2.id.toString());
    console.log("- 商品价格:", formatEther(purchase2.productPrice));
    console.log("- 分佣金额:", formatEther(commissionAmount2));
    console.log("- 推荐码:", referral2.refCode);

    console.log("\n余额变化（不含Gas）:");
    console.log("拔草人支出:", formatEther(buyerInitialBalance - buyerBalanceAfterPurchase2 - gasUsed3 - gasUsed4));
    console.log("广告主收入:", formatEther(advertiserBalanceAfterPurchase2 - advertiserBalanceBeforePurchase2));
    console.log("种草人2收入:", formatEther(promoter2BalanceAfterPurchase2 - promoter2BalanceBeforePurchase2));
    console.log("预期广告主收入:", formatEther(TASK_PRICE));
    console.log("预期种草人2收入:", formatEther(commissionAmount2));

    printSeparator("步骤 6: 广告主查看任务统计");

    const updatedTask = await contract.getTask(taskId);

    console.log("任务统计信息:");
    console.log("- 转发次数（推荐次数）:", updatedTask.referralCount.toString());
    console.log("- 消费次数（购买次数）:", updatedTask.purchaseCount.toString());
    console.log("- 剩余奖金池:", formatEther(updatedTask.bonusPool));
    console.log("- 初始奖金池:", formatEther(BONUS_POOL));
    console.log("- 已支付分佣总额:", formatEther(BONUS_POOL - updatedTask.bonusPool));
    console.log("- 预期已支付分佣:", formatEther(commissionAmount1 + commissionAmount2));

    printSeparator("步骤 7: 种草人1查看分佣记录");

    const promoter1Purchases = await contract.getPromoterPurchases(await promoter1.getAddress());
    console.log("种草人1的分佣记录数量:", promoter1Purchases.length);

    let promoter1TotalCommission = 0n;
    for (const purchaseId of promoter1Purchases) {
      const purchase = await contract.getPurchase(purchaseId);
      console.log("\n购买记录 ID:", purchase.id.toString());
      console.log("- 购买时间:", new Date(Number(purchase.timestamp) * 1000).toLocaleString());
      console.log("- 商品价格:", formatEther(purchase.productPrice));
      console.log("- 分佣金额:", formatEther(purchase.commissionAmount));
      console.log("- 买家:", purchase.buyer);
      promoter1TotalCommission += purchase.commissionAmount;
    }
    console.log("\n种草人1总分佣金额:", formatEther(promoter1TotalCommission));

    printSeparator("步骤 8: 种草人2查看分佣记录");

    const promoter2Purchases = await contract.getPromoterPurchases(await promoter2.getAddress());
    console.log("种草人2的分佣记录数量:", promoter2Purchases.length);

    let promoter2TotalCommission = 0n;
    for (const purchaseId of promoter2Purchases) {
      const purchase = await contract.getPurchase(purchaseId);
      console.log("\n购买记录 ID:", purchase.id.toString());
      console.log("- 购买时间:", new Date(Number(purchase.timestamp) * 1000).toLocaleString());
      console.log("- 商品价格:", formatEther(purchase.productPrice));
      console.log("- 分佣金额:", formatEther(purchase.commissionAmount));
      console.log("- 买家:", purchase.buyer);
      promoter2TotalCommission += purchase.commissionAmount;
    }
    console.log("\n种草人2总分佣金额:", formatEther(promoter2TotalCommission));

    printSeparator("步骤 9: 种草人排行榜（按分佣金额排序前5位）");

    const allTaskIds = await contract.getAllTasks();
    console.log("所有任务数量:", allTaskIds.length);

    const promoterCommissions = new Map<string, bigint>();

    for (const taskId of allTaskIds) {
      const task = await contract.getTask(taskId);
      const referralCount = task.referralCount;
      
      for (let i = 1; i <= referralCount; i++) {
        const referral = await contract.getReferral(i);
        const purchases = await contract.getPromoterPurchases(referral.promoter);

        let totalCommission = 0n;
        for (const purchaseId of purchases) {
          const purchase = await contract.getPurchase(purchaseId);
          if (purchase.taskId === taskId) {
            totalCommission += purchase.commissionAmount;
          }
        }

        const currentCommission = promoterCommissions.get(referral.promoter) || 0n;
        promoterCommissions.set(referral.promoter, currentCommission + totalCommission);
      }
    }

    const sortedPromoters = Array.from(promoterCommissions.entries())
      .sort((a, b) => (b[1] > a[1] ? 1 : b[1] < a[1] ? -1 : 0))
      .slice(0, 5);

    console.log("\n🏆 种草人排行榜 TOP 5 🏆\n");
    if (sortedPromoters.length === 0) {
      console.log("暂无数据");
    } else {
      for (let i = 0; i < sortedPromoters.length; i++) {
        const [address, commission] = sortedPromoters[i];
        const rank = i + 1;
        const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "  ";
        console.log(`${medal} 排名 ${rank}`);
        console.log(`   地址: ${address}`);
        console.log(`   分佣金额: ${formatEther(commission)}`);
        console.log();
      }
    }

    printSeparator("测试总结");

    console.log("✅ 所有测试步骤完成！");
    console.log("\n关键数据验证:");
    console.log("- 任务转发次数:", updatedTask.referralCount.toString(), "(预期: 2)");
    console.log("- 任务购买次数:", updatedTask.purchaseCount.toString(), "(预期: 2)");
    console.log("- 种草人1分佣金额:", formatEther(promoter1TotalCommission), "(预期:", formatEther(commissionAmount1), ")");
    console.log("- 种草人2分佣金额:", formatEther(promoter2TotalCommission), "(预期:", formatEther(commissionAmount2), ")");
    console.log("- 剩余奖金池:", formatEther(updatedTask.bonusPool), "(预期:", formatEther(BONUS_POOL - commissionAmount1 - commissionAmount2), ")");

    expect(Number(updatedTask.referralCount)).to.equal(2);
    expect(Number(updatedTask.purchaseCount)).to.equal(2);
    expect(promoter1TotalCommission).to.equal(commissionAmount1);
    expect(promoter2TotalCommission).to.equal(commissionAmount2);
    expect(updatedTask.bonusPool).to.equal(BONUS_POOL - commissionAmount1 - commissionAmount2);
  });
});
