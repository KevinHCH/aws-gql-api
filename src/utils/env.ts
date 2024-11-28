export const enum Stage {
  develop = 'develop',
  staging = 'staging',
  prod = 'prod',
  test = 'test',
}
export function getStage(stage: string): string {
  switch (stage) {
    case Stage.prod:
      return Stage.prod;
    case Stage.staging:
      return Stage.staging;
    case Stage.test:
      return Stage.test;
    default:
      return Stage.develop;
  }
}