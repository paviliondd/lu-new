import RichTextRenderer from "@/app/components/RichTextRenderer/Renderer";
import { getCodeBlockLabels } from "@/app/components/CodeBlock/labels";
import { highlightCodeBlocks } from "@/lib/content/highlight";

const demoContent = `
<pre data-language="markdown"><code class="language-markdown"># Tiêu đề: [Vấn đề cụ thể] + [Giải pháp/Kết quả]

## Tóm tắt (2-3 câu)
- Bài toán gì?
- Tại sao quan trọng?
- Kết quả đạt được?

## Bối cảnh
- Môi trường: AWS Free Tier, Ubuntu 22.04, minikube
- Công cụ: Terraform 1.7, Docker 24.x

## Quá trình thực hiện
### Bước 1: ...
(Code block + ảnh chụp terminal)

### Bước 2: ...
(Lỗi gặp phải + cách fix)

## Kết quả
(Ảnh chụp màn hình thành công, metric, dashboard)

## Lỗi tôi đã mắc phải
(Thành thật chia sẻ lỗi — điều này tạo credibility)

## Tài liệu tham khảo
- Link docs chính thức
- Link GitHub repo (nếu có)

## Kết luận
- Bài học chính
- Câu hỏi mở cho người đọc</code></pre>
<table><thead><tr><th>Số lượng</th><th>Đánh giá</th></tr></thead><tbody>
<tr><td>&lt;20 bài</td><td>Thiếu. Nhà tuyển dụng thấy bạn mới bắt đầu.</td></tr>
<tr><td>24 bài</td><td>Đủ sàn. Nhưng còn gap kiến thức.</td></tr>
<tr><td>30–36 bài</td><td><strong>Sweet spot.</strong> Cover đủ, mỗi bài có depth.</td></tr>
<tr><td>&gt;40 bài</td><td>Nguy cơ nông. 40 bài 800 từ kém hơn 30 bài 2.500 từ.</td></tr>
</tbody></table>`;

const languageExamples = `
<pre data-language="html"><code class="language-html">&lt;article&gt;Hello LinuxUnity&lt;/article&gt;</code></pre>
<pre data-language="python"><code class="language-python">def deploy():
    return "ready"</code></pre>
<pre data-language="go"><code class="language-go">package main

import "fmt"

func main() {
    fmt.Println("ready")
}</code></pre>`;

export default async function DesignPreviewPage() {
  const content = await highlightCodeBlocks(`${demoContent}${languageExamples}`);
  return (
    <main className="theme-page min-h-screen px-4 py-12 sm:px-6">
      <RichTextRenderer content={content} contentKey="design-preview" labels={getCodeBlockLabels("vi")} />
    </main>
  );
}
