<template>
    <div class="wrapper stack">
        <template v-for="(name, index) in locales.structureComponent" :key="index">
            <div class="subtitle-2 grey--text mb-2">
                {{ locales.structureComponent[index] }}
            </div>
            <div class="split split-full center mt-2 mb-4">
                <Button color="blue" @click="$emit('dec-parameter', 'structure', -1, 1, 0.1, index)">
                    <Icon :size="14" icon="icon-chevron-left"></Icon>
                </Button>
                <RangeInput
                    :minIndex="-1"
                    :maxIndex="1"
                    :indexValue="data.structure[index]"
                    :increment="0.1"
                    @input="(e) => setValueWrap(e, 'structure', index)"
                    style="width: 100%"
                    class="pl-3 pr-3"
                />
                <Button color="blue" @click="$emit('inc-parameter', 'structure', -1, 1, 0.1, index)">
                    <Icon :size="14" icon="icon-chevron-right"></Icon>
                </Button>
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Button from '../../../components/Button.vue';
import Icon from '../../../components/Icon.vue';
import Module from '../../../components/Module.vue';
import RangeInput from '../../../components/RangeInput.vue';

const ComponentName = 'Structure';
export default defineComponent({
    name: ComponentName,
    components: {
        Button,
        Icon,
        Module,
        RangeInput,
    },
    props: {
        data: Object,
        locales: Object,
    },
    methods: {
        setValueWrap(e: Event, parameterName: string, indexValue: string | number | symbol) {
            const originalValues = [...this.data[parameterName]];
            originalValues[indexValue] = parseFloat(e.target['value']);
            this.$emit('set-parameter', parameterName, originalValues);
        },
    },
});
</script>
