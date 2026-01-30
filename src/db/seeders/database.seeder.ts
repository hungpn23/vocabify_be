import { Visibility } from "@api/deck/deck.enum";
import { Card } from "@db/entities/card.entity";
import { Deck } from "@db/entities/deck.entity";
import { User } from "@db/entities/user.entity";
import { faker } from "@faker-js/faker";
import { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";

const cardResources = [
	{ term: "Ability", definition: "Khả năng, năng lực" },
	{ term: "Able", definition: "Có thể, có khả năng" },
	{ term: "About", definition: "Về, khoảng" },
	{ term: "Above", definition: "Ở trên" },
	{ term: "Accept", definition: "Chấp nhận" },
	{ term: "According", definition: "Theo như" },
	{ term: "Account", definition: "Tài khoản" },
	{ term: "Across", definition: "Băng qua, ngang qua" },
	{ term: "Act", definition: "Hành động, diễn" },
	{ term: "Action", definition: "Hành động" },
	{ term: "Activity", definition: "Hoạt động" },
	{ term: "Actually", definition: "Thực ra, quả thật" },
	{ term: "Add", definition: "Thêm vào" },
	{ term: "Address", definition: "Địa chỉ" },
	{ term: "Administration", definition: "Sự quản lý, chính quyền" },
	{ term: "Admit", definition: "Thừa nhận" },
	{ term: "Adult", definition: "Người lớn, trưởng thành" },
	{ term: "Affect", definition: "Ảnh hưởng đến" },
	{ term: "After", definition: "Sau, sau khi" },
	{ term: "Again", definition: "Lại, lần nữa" },
	{ term: "Against", definition: "Chống lại, ngược lại" },
	{ term: "Age", definition: "Tuổi" },
	{ term: "Agency", definition: "Đại lý, cơ quan" },
	{ term: "Agent", definition: "Đại lý, người đại diện" },
	{ term: "Ago", definition: "Cách đây" },
	{ term: "Agree", definition: "Đồng ý" },
	{ term: "Agreement", definition: "Sự đồng ý, hợp đồng" },
	{ term: "Ahead", definition: "Về phía trước" },
	{ term: "Air", definition: "Không khí" },
	{ term: "All", definition: "Tất cả" },
	{ term: "Allow", definition: "Cho phép" },
	{ term: "Almost", definition: "Hầu như, gần như" },
	{ term: "Alone", definition: "Một mình" },
	{ term: "Along", definition: "Dọc theo" },
	{ term: "Already", definition: "Đã, rồi" },
	{ term: "Also", definition: "Cũng, cũng vậy" },
	{ term: "Although", definition: "Mặc dù" },
	{ term: "Always", definition: "Luôn luôn" },
	{ term: "American", definition: "Người Mỹ, thuộc về nước Mỹ" },
	{ term: "Among", definition: "Trong số, giữa" },
	{ term: "Amount", definition: "Số lượng" },
	{ term: "Analysis", definition: "Sự phân tích" },
	{ term: "And", definition: "Và" },
	{ term: "Animal", definition: "Động vật" },
	{ term: "Another", definition: "Khác" },
	{ term: "definition", definition: "Câu trả lời" },
	{ term: "Any", definition: "Bất kỳ" },
	{ term: "Anyone", definition: "Bất kỳ ai" },
	{ term: "Anything", definition: "Bất cứ điều gì" },
	{ term: "Appear", definition: "Xuất hiện" },
	{ term: "Apply", definition: "Áp dụng, nộp đơn" },
	{ term: "Approach", definition: "Tiếp cận" },
	{ term: "Area", definition: "Khu vực" },
	{ term: "Argue", definition: "Tranh luận" },
	{ term: "Arm", definition: "Cánh tay" },
	{ term: "Around", definition: "Xung quanh" },
	{ term: "Arrive", definition: "Đến nơi" },
	{ term: "Art", definition: "Nghệ thuật" },
	{ term: "Article", definition: "Bài báo, điều khoản" },
	{ term: "Artist", definition: "Nghệ sĩ" },
	{ term: "As", definition: "Như, là" },
	{ term: "Ask", definition: "Hỏi" },
	{ term: "Assume", definition: "Cho rằng, giả sử" },
	{ term: "At", definition: "Tại, ở" },
	{ term: "Attack", definition: "Tấn công" },
	{ term: "Attention", definition: "Sự chú ý" },
	{ term: "Attorney", definition: "Luật sư" },
	{ term: "Audience", definition: "Khán giả" },
	{ term: "Author", definition: "Tác giả" },
	{ term: "Authority", definition: "Quyền lực, chính quyền" },
	{ term: "Available", definition: "Có sẵn" },
	{ term: "Avoid", definition: "Tránh" },
	{ term: "Away", definition: "Đi xa, ra xa" },
	{ term: "Baby", definition: "Em bé" },
	{ term: "Back", definition: "Lưng, phía sau" },
	{ term: "Bad", definition: "Tệ, xấu" },
	{ term: "Bag", definition: "Cái túi" },
	{ term: "Ball", definition: "Quả bóng" },
	{ term: "Bank", definition: "Ngân hàng" },
	{ term: "Bar", definition: "Quán bar, thanh (sắt)" },
	{ term: "Base", definition: "Cơ sở, nền tảng" },
	{ term: "Be", definition: "Thì, là, ở" },
	{ term: "Beat", definition: "Đánh, nhịp đập" },
	{ term: "Beautiful", definition: "Xinh đẹp" },
	{ term: "Because", definition: "Bởi vì" },
	{ term: "Become", definition: "Trở thành" },
	{ term: "Bed", definition: "Cái giường" },
	{ term: "Before", definition: "Trước, trước khi" },
	{ term: "Begin", definition: "Bắt đầu" },
	{ term: "Behavior", definition: "Hành vi" },
	{ term: "Behind", definition: "Phía sau" },
	{ term: "Believe", definition: "Tin tưởng" },
	{ term: "Benefit", definition: "Lợi ích" },
	{ term: "Best", definition: "Tốt nhất" },
	{ term: "Better", definition: "Tốt hơn" },
	{ term: "Between", definition: "Ở giữa" },
	{ term: "Beyond", definition: "Vượt ra ngoài" },
	{ term: "Big", definition: "To, lớn" },
	{ term: "Bill", definition: "Hóa đơn" },
	{ term: "Billion", definition: "Tỷ" },
	{ term: "Bit", definition: "Một chút, mảnh" },
	{ term: "Black", definition: "Màu đen" },
	{ term: "Blood", definition: "Máu" },
	{ term: "Blue", definition: "Màu xanh da trời" },
	{ term: "Board", definition: "Cái bảng" },
	{ term: "Body", definition: "Cơ thể" },
	{ term: "Book", definition: "Quyển sách" },
	{ term: "Born", definition: "Được sinh ra" },
	{ term: "Both", definition: "Cả hai" },
	{ term: "Box", definition: "Cái hộp" },
	{ term: "Boy", definition: "Cậu bé" },
	{ term: "Break", definition: "Làm vỡ, nghỉ giải lao" },
	{ term: "Bring", definition: "Mang đến" },
	{ term: "Brother", definition: "Anh/em trai" },
	{ term: "Budget", definition: "Ngân sách" },
	{ term: "Build", definition: "Xây dựng" },
	{ term: "Building", definition: "Tòa nhà" },
	{ term: "Business", definition: "Kinh doanh" },
	{ term: "But", definition: "Nhưng" },
	{ term: "Buy", definition: "Mua" },
	{ term: "By", definition: "Bởi, bằng" },
	{ term: "Call", definition: "Gọi điện" },
	{ term: "Camera", definition: "Máy ảnh" },
	{ term: "Campaign", definition: "Chiến dịch" },
	{ term: "Can", definition: "Có thể" },
	{ term: "Cancer", definition: "Bệnh ung thư" },
	{ term: "Candidate", definition: "Ứng cử viên" },
	{ term: "Capital", definition: "Thủ đô, vốn" },
	{ term: "Car", definition: "Xe hơi" },
	{ term: "Card", definition: "Thẻ, thiệp" },
	{ term: "Care", definition: "Chăm sóc" },
	{ term: "Career", definition: "Sự nghiệp" },
	{ term: "Carry", definition: "Mang, vác" },
	{ term: "Case", definition: "Trường hợp, vụ án" },
	{ term: "Catch", definition: "Bắt, chụp" },
	{ term: "Cause", definition: "Nguyên nhân" },
	{ term: "Cell", definition: "Tế bào" },
	{ term: "Center", definition: "Trung tâm" },
	{ term: "Central", definition: "Thuộc trung tâm" },
	{ term: "Century", definition: "Thế kỷ" },
	{ term: "Certain", definition: "Chắc chắn" },
	{ term: "Certainly", definition: "Chắc chắn, dĩ nhiên" },
	{ term: "Chair", definition: "Cái ghế" },
	{ term: "Challenge", definition: "Thử thách" },
	{ term: "Chance", definition: "Cơ hội" },
	{ term: "Change", definition: "Thay đổi" },
	{ term: "Character", definition: "Nhân vật, tính cách" },
	{ term: "Charge", definition: "Phí, sạc điện" },
	{ term: "Check", definition: "Kiểm tra" },
	{ term: "Child", definition: "Đứa trẻ" },
	{ term: "Choice", definition: "Sự lựa chọn" },
	{ term: "Choose", definition: "Lựa chọn" },
	{ term: "Church", definition: "Nhà thờ" },
	{ term: "City", definition: "Thành phố" },
	{ term: "Claim", definition: "Đòi hỏi, tuyên bố" },
	{ term: "Class", definition: "Lớp học" },
	{ term: "Clear", definition: "Rõ ràng" },
	{ term: "Clearly", definition: "Một cách rõ ràng" },
	{ term: "Close", definition: "Đóng, gần" },
	{ term: "Coach", definition: "Huấn luyện viên" },
	{ term: "Cold", definition: "Lạnh" },
	{ term: "Collection", definition: "Bộ sưu tập" },
	{ term: "College", definition: "Trường cao đẳng" },
	{ term: "Color", definition: "Màu sắc" },
	{ term: "Come", definition: "Đến" },
	{ term: "Commercial", definition: "Thương mại" },
	{ term: "Common", definition: "Chung, phổ biến" },
	{ term: "Community", definition: "Cộng đồng" },
	{ term: "Company", definition: "Công ty" },
	{ term: "Compare", definition: "So sánh" },
	{ term: "Computer", definition: "Máy tính" },
	{ term: "Concern", definition: "Mối quan tâm, lo lắng" },
	{ term: "Condition", definition: "Điều kiện" },
	{ term: "Conference", definition: "Hội nghị" },
	{ term: "Congress", definition: "Quốc hội" },
	{ term: "Consider", definition: "Cân nhắc, xem xét" },
	{ term: "Consumer", definition: "Người tiêu dùng" },
	{ term: "Contain", definition: "Chứa đựng" },
	{ term: "Continue", definition: "Tiếp tục" },
	{ term: "Control", definition: "Kiểm soát" },
	{ term: "Cost", definition: "Chi phí, giá" },
	{ term: "Could", definition: "Có thể (quá khứ của can)" },
	{ term: "Country", definition: "Đất nước" },
	{ term: "Couple", definition: "Cặp, đôi" },
	{ term: "Course", definition: "Khóa học" },
	{ term: "Court", definition: "Tòa án, sân (thể thao)" },
	{ term: "Cover", definition: "Bao phủ, che" },
	{ term: "Create", definition: "Tạo ra" },
	{ term: "Crime", definition: "Tội ác" },
	{ term: "Cultural", definition: "Thuộc về văn hóa" },
	{ term: "Culture", definition: "Văn hóa" },
	{ term: "Cup", definition: "Cái cốc, tách" },
	{ term: "Current", definition: "Hiện tại" },
	{ term: "Customer", definition: "Khách hàng" },
	{ term: "Cut", definition: "Cắt" },
];

const shuffleArray = <T>(array: T[]) => {
	const arr = [...array];

	for (let i = arr.length - 1; i > 0; i--) {
		const random = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[random]] = [arr[random], arr[i]];
	}

	return arr;
};

export class DatabaseSeeder extends Seeder {
	async run(em: EntityManager) {
		console.time("🌱 Seeding database");

		const admin = em.create(User, {
			username: "hungpn23",
			email: "hungpn23@gmail.com",
			password: "Password@123",
			emailVerified: true,
		});

		// admin01 deck
		const deck = em.create(Deck, {
			owner: admin,
			name: "30 Basic English Words",
			description:
				"A collection of 30 fundamental English vocabulary words for beginners.",
			visibility: Visibility.PUBLIC,
			createdBy: admin.id,
		});

		for (const vocab of shuffleArray(cardResources).slice(0, 30)) {
			em.create(Card, {
				deck: deck,
				term: vocab.term,
				definition: vocab.definition,
				termLanguage: "en",
				definitionLanguage: "vi",
				examples: [],
			});
		}

		for (let i = 0; i < 200; i++) {
			const user = em.create(User, {
				username: faker.internet.username(),
				email: faker.internet.email({ provider: "example.com" }),
				password: "Password@123",
				emailVerified: true,
				avatarUrl: faker.image.avatar(),
			});

			const cardCount = faker.number.int({ min: 5, max: 20 });
			const visibility = faker.helpers.arrayElement(Object.values(Visibility));

			const deck = em.create(Deck, {
				owner: user,
				name: `${cardCount} Basic English Words by ${user.username}`,
				description: `A collection of ${cardCount} fundamental English vocabulary words.`,
				visibility,
				passcode: visibility === Visibility.PROTECTED ? "1234" : null,
				createdBy: user.id,
			});

			for (const vocab of shuffleArray(cardResources).slice(0, cardCount)) {
				em.create(Card, {
					deck,
					term: vocab.term,
					definition: vocab.definition,
					termLanguage: "en",
					definitionLanguage: "vi",
					examples: [],
				});
			}
		}

		await em.flush();

		console.timeEnd("🌱 Seeding database");
	}
}
