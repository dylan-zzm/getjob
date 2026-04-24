import enHome from '@/config/locale/messages/en/pages/index.json';
import zhHome from '@/config/locale/messages/zh/pages/index.json';

describe('homepage sections', () => {
  it('keeps the full landing page below the focused hero', () => {
    const expectedSections = [
      'hero',
      'introduce',
      'benefits',
      'usage',
      'features',
      'stats',
      'faq',
      'cta',
    ];

    expect(zhHome.page.show_sections).toEqual(expectedSections);
    expect(enHome.page.show_sections).toEqual(expectedSections);
  });
});
